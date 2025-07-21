/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { Dispatch, JSX, SetStateAction } from "react";
import { JankenHand } from "../../../core";
import chokiImage from "../assets/choki_background.svg";
import guImage from "../assets/gu_background.svg";
import paImage from "../assets/pa_background.svg";
import styles from "./Computer.module.css";

interface ComputerProps {
	currentGesture: JankenHand;
	setCurrentGesture: Dispatch<SetStateAction<JankenHand>>;
}
export function Computer({ currentGesture }: ComputerProps): JSX.Element {
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
			<h1 className="h-12">computer</h1>
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
