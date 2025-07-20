/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { type JSX, useRef, useState } from "react";
import { JankenHand } from "../../core";
import { KaoJanken, type KaoJankenUserComponent } from "../KaoJanken";
import styles from "./JankenPlayground.module.css";

export function JankenPlayground(): JSX.Element {
	const [playing, setPlaying] = useState(false);

	const kaoJankenUserRef = useRef<KaoJankenUserComponent>(null);
	const [currentUserGesture, setCurrentUserGesture] = useState<JankenHand>(
		JankenHand.UNKNOWN,
	);

	const handleStartButtonClick = async () => {
		await kaoJankenUserRef.current?.start();
		setPlaying(true);
	};

	return (
		<div className={styles.container}>
			<h1>KaoJanken</h1>
			<div className={styles.playground}>
				<KaoJanken.User
					ref={kaoJankenUserRef}
					currentGesture={currentUserGesture}
					setCurrentGesture={setCurrentUserGesture}
				/>
				<h1>vs</h1>
				<KaoJanken.Computer />
			</div>
			<p>
				<button
					type="button"
					onClick={handleStartButtonClick}
					disabled={playing}
				>
					start
				</button>
			</p>
		</div>
	);
}
