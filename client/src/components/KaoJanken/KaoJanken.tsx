/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { type JSX, useRef } from "react";
import { cameraService } from "../../core";
import styles from "./KaoJanken.module.css";

export const KaoJanken = (): JSX.Element => {
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	let pc: RTCPeerConnection;
	const apiPort = import.meta.env.VITE_API_PORT || "8080";
	const apiHost = import.meta.env.VITE_API_HOST || "127.0.0.1";
	const handleButtonClick = async () => {
		if (!pc) pc = new RTCPeerConnection();
		pc.ontrack = (event) => {
			// statusSpan.textContent = "Receiving processed stream...";
			// リモートビデオにストリームを設定
			if (remoteVideoRef.current) {
				if (remoteVideoRef.current.srcObject !== event.streams[0]) {
					remoteVideoRef.current.srcObject = event.streams[0];
					console.log("Received remote stream");
				}
			}
		};
		const stream = await cameraService.start({
			video: {
				width: 700,
				height: 700,
			},
			audio: false,
		});
		if (localVideoRef.current) cameraService.render(localVideoRef.current);
		stream?.getTracks().forEach((track) => pc.addTrack(track, stream));
		try {
			// Offerを作成
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			// statusSpan.textContent = "Offer created. Sending to server...";

			// PythonサーバーにOfferを送信
			const response = await fetch(`http://${apiHost}:${apiPort}/kaojanken`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sdp: offer.sdp,
					type: offer.type,
				}),
			});

			// サーバーからAnswerを受信
			const answer = await response.json();
			// statusSpan.textContent = "Answer received. Connecting...";

			// Answerを設定して接続を確立
			await pc.setRemoteDescription(answer);
			// statusSpan.textContent = "Connected!";
		} catch (e) {
			alert("Signaling failed: " + e);
			pc.close();
		}
	};
	return (
		<div>
			<h1>KaoJanken</h1>
			<button type="button" onClick={handleButtonClick}>
				start
			</button>
			<video className={styles.video} ref={localVideoRef} autoPlay>
				<track kind="captions" default />
			</video>
			<video className={styles.video} ref={remoteVideoRef} autoPlay>
				<track kind="captions" default />
			</video>
		</div>
	);
};
