/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { JSX } from "react";

import { AnimatePresence, motion } from "motion/react";

import styles from "./Record.module.css";

interface RecordProps {
	wins: number;
	loses: number;
	draws: number;
}

export function Record({ wins, loses, draws }: RecordProps): JSX.Element {
	return (
		<AnimatePresence>
			{![wins, loses, draws].every((v) => v === 0) && (
				<motion.div
					layout
					className={styles.record}
					initial={{ scaleY: 0, height: 0, paddingBottom: 0 }}
					animate={{ scaleY: 1, height: 0, paddingBottom: "2.5rem" }}
				>
					<p>Win: {wins}</p>
					<p>Lose: {loses}</p>
					<p>Draw: {draws}</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
