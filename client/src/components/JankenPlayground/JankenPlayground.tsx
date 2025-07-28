/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { type JSX, useEffect, useRef, useState } from "react";
import { useDebounce } from "react-use";
import { Janken, JankenHand } from "@/core";
import { sleep } from "@/utils";
import { KaoJanken, type KaoJankenUserComponent } from "../KaoJanken";
import type { KaoJankenComputerComponent } from "../KaoJanken/Computer";
import { type KaoJankenModalComponent, Modal } from "../Modal";

export function JankenPlayground(): JSX.Element {
	const [playingFlag, setPlayingFlag] = useState(false);
	const afkFlag = useRef(false);

	const kaoJankenUserRef = useRef<KaoJankenUserComponent>(null);
	const kaoJankenComputerRef = useRef<KaoJankenComputerComponent>(null);
	const kaoJankenModalRef = useRef<KaoJankenModalComponent>(null);

	const [currentUserGesture, setCurrentUserGesture] = useState<JankenHand>(
		JankenHand.UNKNOWN,
	);
	const [currentComputerGesture, setCurrentComputerGesture] =
		useState<JankenHand>(JankenHand.UNKNOWN);

	const handleStartButtonClick = async () => {
		start();
		setPlayingFlag(true);
	};

	const start = async () => {
		if (afkFlag.current) return;
		await kaoJankenUserRef.current?.start();
		kaoJankenComputerRef.current?.start();
	};

	useDebounce(
		async () => {
			if (!playingFlag) return;
			const user = new Janken(currentUserGesture);
			const computer = new Janken(currentComputerGesture);
			kaoJankenModalRef.current?.show(user.examine(computer));
			kaoJankenUserRef.current?.pause();
			await sleep(2000);
			kaoJankenComputerRef.current?.stop();
			kaoJankenModalRef.current?.close();
			await sleep(1000);
			start();
		},
		3000,
		[currentUserGesture, currentComputerGesture],
	);

	useEffect(() => {
		if (!playingFlag) return;
		if (currentUserGesture === JankenHand.UNKNOWN) {
			kaoJankenComputerRef.current?.stop();
			afkFlag.current = true;
		} else if (afkFlag.current) {
			kaoJankenComputerRef.current?.start();
			afkFlag.current = false;
		}
	}, [currentUserGesture, playingFlag]);

	return (
		<>
			<Modal ref={kaoJankenModalRef} />
			<div className="flex size-4 h-fit w-fit flex-col items-center gap-4 rounded-box border-6 border-base-300 p-10 text-center">
				<h1>KaoJanken</h1>
				<div className="container flex flex-row justify-around gap-4">
					<KaoJanken.User
						ref={kaoJankenUserRef}
						currentGesture={currentUserGesture}
						setCurrentGesture={setCurrentUserGesture}
					/>
					<h1>vs</h1>
					<KaoJanken.Computer
						ref={kaoJankenComputerRef}
						currentGesture={currentComputerGesture}
						setCurrentGesture={setCurrentComputerGesture}
					/>
				</div>
				<p>
					<button
						type="button"
						onClick={handleStartButtonClick}
						disabled={playingFlag}
					>
						start
					</button>
				</p>
			</div>
		</>
	);
}
