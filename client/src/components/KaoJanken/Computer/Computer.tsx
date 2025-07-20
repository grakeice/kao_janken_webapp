/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { JSX } from "react";
import styles from "./Computer.module.css";

export function Computer(): JSX.Element {
	return (
		<div>
			<h1>computer</h1>
			<div className={styles.hand}></div>
		</div>
	);
}
