/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { type JSX, useRef, useState } from "react";
import { JankenHand } from "../../core";
import { KaoJanken, type KaoJankenUserComponent } from "../KaoJanken";

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
		<div className="flex size-4 h-fit w-fit flex-col items-center gap-4 rounded-4xl border-6 border-base-300 p-10 text-center">
			<h1>KaoJanken</h1>
			<div className="container flex flex-row justify-around gap-4">
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
					className="btn btn-lg btn-neutral rounded-selector"
				>
					start
				</button>
			</p>
		</div>
	);
}
