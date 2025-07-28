/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export async function sleep(t: number) {
	return new Promise((r) => setTimeout(r, t));
}
