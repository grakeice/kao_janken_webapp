import asyncio
import json
import logging
import uuid

import cv2
from aiohttp import web
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription

# ルートディレクトリとロガーの設定
ROOT = "."
logging.basicConfig(level=logging.INFO)
pcs = set()  # PeerConnectionを保持するセット


# OpenCVで加工するための動画トラッククラス
class VideoTransformTrack(MediaStreamTrack):
    """
    OpenCVで映像フレームを加工するMediaStreamTrackのサブクラス
    """

    kind = "video"

    def __init__(self, track):
        super().__init__()
        self.track = track

    async def recv(self):
        # 元のトラックからフレームを受信
        frame = await self.track.recv()

        # フレームをOpenCVで扱えるndarray形式に変換
        img = frame.to_ndarray(format="bgr24")

        # --- ここでOpenCVを使った画像処理を行う ---
        # 例: グレースケールに変換
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # グレースケール画像を3チャンネルのBGRに戻す（WebRTCはBGRを期待するため）
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        # ------------------------------------

        # 加工後のndarrayをVideoFrameに戻して返す
        new_frame = frame.from_ndarray(img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame


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
            # 加工用トラックを作成し、コネクションに追加
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

if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=8080)
