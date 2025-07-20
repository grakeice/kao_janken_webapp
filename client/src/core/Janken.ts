/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export enum JankenHand {
	GU,
	CHOKI,
	PA,
	UNKNOWN,
}

interface IJanken {
	hand: JankenHand;
	examine(opponent: Janken): "win" | "lose" | "draw" | "fail";
}

export class Janken implements IJanken {
	hand: JankenHand;

	constructor(hand: JankenHand) {
		this.hand = hand;
	}

	examine(opponent: Janken): "win" | "lose" | "draw" | "fail" {
		switch (opponent.hand) {
			case JankenHand.GU:
				if (this.hand === JankenHand.GU) return "draw";
				if (this.hand === JankenHand.CHOKI) return "lose";
				if (this.hand === JankenHand.PA) return "win";
				else return "fail";
			case JankenHand.CHOKI:
				if (this.hand === JankenHand.GU) return "win";
				if (this.hand === JankenHand.CHOKI) return "draw";
				if (this.hand === JankenHand.PA) return "lose";
				else return "fail";
			case JankenHand.PA:
				if (this.hand === JankenHand.GU) return "lose";
				if (this.hand === JankenHand.CHOKI) return "win";
				if (this.hand === JankenHand.PA) return "draw";
				else return "fail";
			case JankenHand.UNKNOWN:
				return "fail";
		}
	}
}
