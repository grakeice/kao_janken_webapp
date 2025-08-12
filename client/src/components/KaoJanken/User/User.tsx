/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import {
	type Dispatch,
	type JSX,
	type RefObject,
	type SetStateAction,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

import { AnimatePresence, motion } from "motion/react";
import { FaArrowRightLong } from "react-icons/fa6";

import chokiImage from "@/assets/choki.svg";
import guImage from "@/assets/gu.svg";
import paImage from "@/assets/pa.svg";
import { cameraService, JankenHand } from "@/core";
import styles from "./User.module.css";
import { WebRTCConnection } from "./utils";

interface UserProps {
	ref?: RefObject<KaoJankenUserComponent | null>;
	currentGesture: JankenHand;
	setCurrentGesture: Dispatch<SetStateAction<JankenHand>>;
}

export interface KaoJankenUserComponent {
	start(): Promise<void>;
	pause(): void;
}

export function User({
	ref,
	currentGesture,
	setCurrentGesture,
}: UserProps): JSX.Element {
	const pc = useRef(new RTCPeerConnection());
	const apiHost = String(import.meta.env.VITE_API_HOST || "127.0.0.1");
	const apiPort = Number(import.meta.env.VITE_API_PORT || "8080");

	const [displayMeshToggle, setDisplayMeshToggle] = useState(true);

	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	const [paused, setPaused] = useState(false);
	const initial = useRef(true);

	useImperativeHandle(ref, () => {
		return {
			async start() {
				setPaused(false);
				if (!initial.current) return;
				initial.current = false;

				const stream = await cameraService.start({
					video: {
						width: 1080,
						height: 1080,
					},
					audio: false,
				});

				const rtcConnection = new WebRTCConnection({
					pc: pc.current,
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
							gesture: "GU" | "CHOKI" | "PA" | "UNKNOWN";
							status: string;
						}[];
					};

					try {
						if (!paused) {
							setCurrentGesture(JankenHand[data.results[0].gesture]);
						} else {
							setCurrentGesture(JankenHand.UNKNOWN);
						}
					} catch {
						setCurrentGesture(JankenHand.UNKNOWN);
					}
				});

				const interval = setInterval(() => {
					socket.send("");
				}, 100);

				socket.addEventListener("close", () => {
					clearInterval(interval);
				});
			},
			pause() {
				setPaused(true);
			},
		};
	});

	const handleToggleMeshButtonClick = () => {
		if (displayMeshToggle) setDisplayMeshToggle(false);
		else setDisplayMeshToggle(true);
	};

	const renderUserHandImage = () => {
		switch (currentGesture) {
			case JankenHand.GU:
				return (
					<img className={styles["hand-image"]} src={guImage} alt="グー" />
				);
			case JankenHand.CHOKI:
				return (
					<img className={styles["hand-image"]} src={chokiImage} alt="チョキ" />
				);
			case JankenHand.PA:
				return (
					<img className={styles["hand-image"]} src={paImage} alt="パー" />
				);
			default:
				return;
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<h1 className="h-12">You</h1>
			<div className={`${styles["janken-field"]} h-80`}>
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
				<AnimatePresence>
					{currentGesture !== JankenHand.UNKNOWN && (
						<motion.div
							layout
							className={styles["user-hand"]}
							initial={{ width: 0, scaleX: 0 }}
							animate={{ width: "20rem", scaleX: 1 }}
							exit={{ width: 0, scaleX: 0 }}
						>
							<FaArrowRightLong size={50} />
							{renderUserHandImage()}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<div className="h-12">
				<button type="button" onClick={handleToggleMeshButtonClick}>
					Face Mesh: {displayMeshToggle ? "on" : "off"}
				</button>
			</div>
		</div>
	);
}
