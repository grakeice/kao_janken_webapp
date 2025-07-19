/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { type JSX, useRef, useState } from "react";
import { cameraService } from "../../core";
import styles from "./KaoJanken.module.css";
import { WebRTCConnection } from "./utils";

export function KaoJanken(): JSX.Element {
	const pc = new RTCPeerConnection();
	const apiHost = String(import.meta.env.VITE_API_HOST || "127.0.0.1");
	const apiPort = Number(import.meta.env.VITE_API_PORT || "8080");

	const [currentGesture, setCurrentGesture] = useState("unknown");
	const [displayMeshToggle, setDisplayMeshToggle] = useState(true);

	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	const handleStartButtonClick = async () => {
		const stream = await cameraService.start({
			video: {
				width: 1080,
				height: 1080,
			},
			audio: false,
		});

		const rtcConnection = new WebRTCConnection({
			pc,
			stream,
			remoteVideoDisplayTarget: remoteVideoRef.current,
			apiUrl: `http://${apiHost}:${apiPort}/kaojanken`,
		});

		if (localVideoRef.current) cameraService.render(localVideoRef.current);
		if (remoteVideoRef.current) rtcConnection.makeConnection();

		const socket = new WebSocket(`ws://${apiHost}:${apiPort}/ws_janken`);

		socket.addEventListener("open", () => {
			console.log("connected to server");
		});

		socket.addEventListener("message", (event) => {
			const data = JSON.parse(event.data) as {
				timestamp: number;
				results: {
					gesture: "gu" | "choki" | "pa" | "unknown";
					status: string;
				}[];
			};
			setCurrentGesture(data.results[0].gesture);
		});

		const interval = setInterval(() => {
			socket.send("");
		}, 100);

		socket.addEventListener("close", () => {
			clearInterval(interval);
		});
	};

	const handleToggleMeshButtonClick = () => {
		if (displayMeshToggle) setDisplayMeshToggle(false);
		else setDisplayMeshToggle(true);
	};

	return (
		<div>
			<h1>KaoJanken</h1>
			<p>あなたの出した顔: {currentGesture}</p>
			<video
				className={styles.video}
				ref={localVideoRef}
				hidden={displayMeshToggle}
				autoPlay
			>
				<track kind="captions" default />
			</video>
			<video
				className={styles.video}
				ref={remoteVideoRef}
				hidden={!displayMeshToggle}
				autoPlay
			>
				<track kind="captions" default />
			</video>
			<p>
				<button type="button" onClick={handleStartButtonClick}>
					start
				</button>
				<button type="button" onClick={handleToggleMeshButtonClick}>
					Face Mesh: {displayMeshToggle ? "on" : "off"}
				</button>
			</p>
		</div>
	);
}
