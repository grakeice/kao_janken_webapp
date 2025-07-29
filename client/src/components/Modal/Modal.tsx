/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { useGSAP } from "@gsap/react";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { SlowMo } from "gsap/EasePack";
import { AnimatePresence, motion } from "motion/react";
import {
	type JSX,
	type RefObject,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { JankenResult } from "@/core";
import { getRandomInt } from "@/utils";
import styles from "./Modal.module.css";

interface ModalProps {
	ref?: RefObject<KaoJankenModalComponent | null>;
}

export interface KaoJankenModalComponent {
	show(result: JankenResult | ""): void;
	close(): void;
}

gsap.registerPlugin(useGSAP, SlowMo);

export function Modal({ ref }: ModalProps): JSX.Element {
	const [message, setMessage] = useState("");
	const messageElementRef = useRef<HTMLHeadingElement>(null);
	const backgroundColor = useRef("");

	useImperativeHandle(ref, () => {
		return {
			show(result) {
				backgroundColor.current = globalThis.matchMedia(
					"(prefers-color-scheme: light)",
				).matches
					? `hsla(${getRandomInt(1, 360)}deg ${getRandomInt(0, 101)}% ${getRandomInt(70, 101)}% / 50%)`
					: `hsla(${getRandomInt(1, 360)}deg ${getRandomInt(0, 101)}% ${getRandomInt(0, 31)}% / 50%)`;
				switch (result) {
					case "win":
						setMessage("You win!");
						confetti({
							zIndex: 5,
							gravity: 6,
							particleCount: 200,
							startVelocity: 125,
							spread: 90,
							scalar: 1.5,
							origin: { y: 0.8 },
							shapes: ["star", "square", "circle"],
							drift: 1,
						});
						break;
					case "draw":
						setMessage("Draw!");
						break;
					case "lose":
						setMessage("You lose...");
						break;
					default:
						setMessage("");
				}
			},
			close() {
				setMessage("");
			},
		};
	});

	useGSAP(() => {
		if (messageElementRef.current && message !== "") {
			const target = messageElementRef.current;
			gsap.to(target, {
				keyframes: {
					"0%": { x: "120vw", skewX: "-45deg" },
					"50%": { skewX: 0 },
					"100%": { x: "-120vw", skewX: "-45deg" },
				},
				duration: 2.0,
				ease: "slow(0.3,0.9)",
			});
		}
	}, [message]);

	return (
		<AnimatePresence>
			{message !== "" && (
				<motion.div
					className={styles.modal}
					style={{
						backgroundColor: backgroundColor.current,
					}}
					initial={{ opacity: 0, visibility: "hidden" }}
					animate={{ opacity: 1, visibility: "visible" }}
					exit={{ opacity: 0, visibility: "hidden" }}
				>
					<h1 className={styles.message} ref={messageElementRef}>
						{message}
					</h1>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
