/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * WebRTC接続の初期化パラメータ
 * @property pc - RTCPeerConnectionインスタンス
 * @property stream - ローカルのMediaStream
 * @property remoteVideoDisplayTarget - リモート映像を表示するvideo要素
 * @property apiUrl - シグナリング用APIのURL
 */
interface ConnectionArgs {
	pc: RTCPeerConnection;
	stream: MediaStream | undefined;
	remoteVideoDisplayTarget: HTMLVideoElement | null;
	apiUrl: string;
}

/**
 * じゃんけん判定結果
 * @property status - 距離や比率などの詳細文字列
 * @property gesture - 判定された手（gu, choki, pa, unknown）
 */
interface JankenResult {
	status: string;
	gesture: string;
}

/**
 * じゃんけんデータ（タイムスタンプと複数顔の結果）
 * @property timestamp - フレームのタイムスタンプ
 * @property results - 顔ごとのじゃんけん判定結果配列
 */
interface JankenData {
	timestamp: number;
	results: JankenResult[];
}

/**
 * WebRTCの接続を管理し、リモート映像やデータチャネルを扱うクラス
 * @example
 * const rtc = new WebRTCConnection({ ... });
 * await rtc.makeConnection();
 */
export class WebRTCConnection {
	private pc;
	private stream;
	private remoteVideoDisplayTarget;
	private apiUrl;
	public data: JankenData | null = null;

	constructor({
		pc,
		stream,
		remoteVideoDisplayTarget,
		apiUrl,
	}: ConnectionArgs) {
		this.pc = pc;
		this.stream = stream;
		this.remoteVideoDisplayTarget = remoteVideoDisplayTarget;
		this.apiUrl = apiUrl;
	}

	/**
	 * WebRTCの接続を確立し、リモート映像をvideo要素に表示する
	 * @returns {Promise<void>}
	 */
	async makeConnection() {
		this.pc.ontrack = (event) => {
			if (this.remoteVideoDisplayTarget) {
				if (this.remoteVideoDisplayTarget.srcObject !== event.streams[0]) {
					this.remoteVideoDisplayTarget.srcObject = event.streams[0];
					console.log("Received remote stream");
				}
			} else {
				console.error("failed to register remote stream");
				return;
			}
		};
		this.stream
			?.getTracks()
			.forEach((track) => this.pc.addTrack(track, this.stream as MediaStream));
		try {
			const offer = await this.pc.createOffer();
			await this.pc.setLocalDescription(offer);

			const response = await fetch(this.apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sdp: offer.sdp,
					type: offer.type,
				}),
			});

			const answer = await response.json();
			await this.pc.setRemoteDescription(answer);
		} catch (e) {
			alert(`Signaling failed: ${e}`);
			this.pc.close();
		}
	}

	/**
	 * コネクションをクローズする
	 */
	[Symbol.dispose]() {
		this.pc.close();
	}
}
