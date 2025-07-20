/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { type JSX, useRef, useState } from "react";
import { useDebounce } from "react-use";
import { Janken, JankenHand } from "../../core";
import { KaoJanken, type KaoJankenUserComponent } from "../KaoJanken";

export function JankenPlayground(): JSX.Element {
	const [playing, setPlaying] = useState(false);

	const kaoJankenUserRef = useRef<KaoJankenUserComponent>(null);
	const [currentUserGesture, setCurrentUserGesture] = useState<JankenHand>(
		JankenHand.UNKNOWN,
	);
	const [currentComputerGesture, setCurrentComputerGesture] =
		useState<JankenHand>(JankenHand.UNKNOWN);

	const handleStartButtonClick = async () => {
		await kaoJankenUserRef.current?.start();
		setPlaying(true);
	};

	useDebounce(
		() => {
			if(currentUserGesture === JankenHand.UNKNOWN){
				setCurrentComputerGesture(JankenHand.UNKNOWN);
				return;
			}
			//0から3までのランダムな整数を生成する
			const randomGesture = [JankenHand.GU, JankenHand.CHOKI, JankenHand.PA][
				Math.floor(Math.random() * 2)
			];
			setCurrentComputerGesture(randomGesture);
			const user = new Janken(currentUserGesture);
			const computer = new Janken(currentComputerGesture);
			console.log(user.examine(computer));
		},
		3000,
		[currentUserGesture, currentComputerGesture],
	);

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
				<KaoJanken.Computer
					currentGesture={currentComputerGesture}
					setCurrentGesture={setCurrentComputerGesture}
				/>
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
