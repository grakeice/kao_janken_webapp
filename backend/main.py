"""
Copyright (c) 2025 grakeice

This software is released under the MIT License.
https://opensource.org/licenses/MIT
"""

import asyncio
import json
import logging
import uuid
import os

from aiohttp import web
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from dotenv import load_dotenv
from face_mesh import FaceLandMarks

load_dotenv()

# ルートディレクトリとロガーの設定
HOST = os.getenv("VITE_API_HOST", "127.0.0.1")
PORT = int(os.getenv("VITE_API_PORT", 8080))

ROOT = "."
logging.basicConfig(level=logging.INFO)
pcs = set()  # PeerConnectionを保持するセット


def estimate_gesture(mouth):
    """
    Calculate the distance between the mouth keypoints and determine the janken gesture.
    """
    distance_0_17 = (
        (mouth[0][0] - mouth[17][0]) ** 2 + (mouth[0][1] - mouth[17][1]) ** 2
    ) ** 0.5
    distance_78_308 = (
        (mouth[78][0] - mouth[308][0]) ** 2 + (mouth[78][1] - mouth[308][1]) ** 2
    ) ** 0.5
    ratio = distance_0_17 / distance_78_308
    if ratio < 0.5:
        janken = "GU"
    elif ratio > 1.5:
        janken = "CHOKI"
    elif 0.5 <= ratio <= 1.5:
        janken = "PA"
    else:
        janken = "UNKNOWN"
    put_str = f"distance vertical:{distance_0_17:5.1f}, horizontal:{distance_78_308:5.1f}, ratio:{ratio:4.2f} ({janken})"
    return put_str, janken


# OpenCVで加工するための動画トラッククラス
class VideoTransformTrack(MediaStreamTrack):
    """
    OpenCVで映像フレームを加工するMediaStreamTrackのサブクラス
    """

    kind = "video"

    def __init__(self, track, data_channel=None):
        super().__init__()
        self.track = track
        self.detector = FaceLandMarks()
        # じゃんけん結果をグローバルで保持
        global latest_janken_result

    async def recv(self):
        global latest_janken_result
        # 元のトラックからフレームを受信
        frame = await self.track.recv()
        # フレームをOpenCVで扱えるndarray形式に変換
        img = frame.to_ndarray(format="bgr24")
        janken_statuses = []
        # --- ここでOpenCVを使った画像処理を行う ---
        self.detector.find_face_keypoints(img)
        self.detector.find_face_keypoints(img)
        for face in self.detector.faces:
            janken_statuses.append(estimate_gesture(face))
        img = self.detector.draw(img)
        # ------------------------------------

        # 最新のじゃんけん結果をグローバル変数に保存
        latest_janken_result = {
            "timestamp": frame.pts,
            "results": [
                {"status": status[0], "gesture": status[1]}
                for status in janken_statuses
            ],
        }

        # 加工後のndarrayをVideoFrameに戻して返す
        new_frame = frame.from_ndarray(img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame


# --- WebSocketでじゃんけん結果を送信するエンドポイント ---
latest_janken_result = {"timestamp": None, "results": []}  # グローバルで最新結果を保持


async def websocket_janken(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    logging.info("WebSocket connection established for janken result")

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                # クライアントから何か受信したら最新のじゃんけん結果を送信
                ws_data = json.dumps(latest_janken_result)
                await ws.send_str(ws_data)
            elif msg.type == web.WSMsgType.ERROR:
                logging.error(f"WebSocket error: {ws.exception()}")
    except Exception as e:
        logging.error(f"WebSocket exception: {e}")
    finally:
        logging.info("WebSocket connection closed for janken result")
    return ws


# クライアントとの接続処理を行う関数
async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    # PeerConnectionの作成
    pc = RTCPeerConnection()
    pc_id = f"PeerConnection({uuid.uuid4()})"
    pcs.add(pc)
    logging.info(f"[{pc_id}] Created for {request.remote}")

    # 受信トラックのハンドリング
    @pc.on("track")
    def on_track(track):
        logging.info(f"Track {track.kind} received")
        if track.kind == "video":
            local_video = VideoTransformTrack(track)
            pc.addTrack(local_video)

        @track.on("ended")
        async def on_ended():
            logging.info(f"Track {track.kind} ended")

    # 接続切断時のハンドリング
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logging.info(f"Connection state is {pc.connectionState}")
        if pc.connectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    # Offerを設定し、Answerを作成
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    # Answerをクライアントに返す
    return web.Response(
        content_type="application/json",
        text=json.dumps(
            {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        ),
    )


async def index(request):
    return web.FileResponse("./client/dist/index.html")


# サーバー終了時にPeerConnectionを閉じる処理
async def on_shutdown(app):
    # すべてのPeerConnectionを閉じる
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        # プリフライトリクエスト用の空レスポンス
        resp = web.Response()
    else:
        resp = await handler(request)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return resp


# Webアプリケーションの設定
app = web.Application(middlewares=[cors_middleware])
app.on_shutdown.append(on_shutdown)

# 静的ファイル配信を追加
# app.router.add_static("/", "./client/dist/", show_index=True)
app.router.add_post("/kaojanken", offer)
app.router.add_get("/ws_janken", websocket_janken)

if __name__ == "__main__":
    web.run_app(app, host=HOST, port=PORT)
