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
} from "react";

import chokiImage from "@/assets/choki_background.svg";
import guImage from "@/assets/gu_background.svg";
import paImage from "@/assets/pa_background.svg";
import { Janken, JankenHand } from "@/core";
import styles from "./Computer.module.css";

export interface KaoJankenComputerComponent {
	start(): void;
	stop(): void;
}

interface ComputerProps {
	currentGesture: JankenHand;
	setCurrentGesture: Dispatch<SetStateAction<JankenHand>>;
	ref?: RefObject<KaoJankenComputerComponent | null>;
}
export function Computer({
	ref,
	currentGesture,
	setCurrentGesture,
}: ComputerProps): JSX.Element {
	useImperativeHandle(ref, () => {
		return {
			start() {
				setCurrentGesture(Janken.getRandomGesture());
			},
			stop() {
				setCurrentGesture(JankenHand.UNKNOWN);
			},
		};
	});

	const renderComputerHandImage = () => {
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
		<div className="flex flex-col items-center justify-between">
			<h1 className="h-12">Computer</h1>
			<div
				className="h-80 w-80"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{renderComputerHandImage()}
			</div>
			<div className="h-12">
				<button type="button" style={{ visibility: "hidden" }}></button>
			</div>
		</div>
	);
}
