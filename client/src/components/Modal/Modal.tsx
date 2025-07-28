/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { AnimatePresence, motion } from "motion/react";
import { type JSX, type RefObject, useImperativeHandle, useState } from "react";
import type { JankenResult } from "@/core";
import styles from "./Modal.module.css";

interface ModalProps {
	ref?: RefObject<KaoJankenModalComponent | null>;
}

export interface KaoJankenModalComponent {
	show(result: JankenResult | ""): void;
	close(): void;
}

export function Modal({ ref }: ModalProps): JSX.Element {
	const [message, setMessage] = useState("");

	useImperativeHandle(ref, () => {
		return {
			show(result) {
				switch (result) {
					case "win":
						setMessage("You win!");
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

	return (
		<AnimatePresence>
			{message !== "" && (
				<motion.div
					className={styles.modal}
					initial={{ opacity: 0, visibility: "hidden" }}
					animate={{ opacity: 1, visibility: "visible" }}
					exit={{ opacity: 0, visibility: "hidden" }}
				>
					<h1>{message}</h1>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
