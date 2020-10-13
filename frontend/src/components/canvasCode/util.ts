
class AssertionError extends Error {

}

export function assert(condition: boolean, message?: string) {
    if (!condition) {
        throw new AssertionError(message || "Assertion failed");
    }
}

export function defined(condition: any) {
    if (condition == undefined) {
        throw new AssertionError("Variable undefined");
    }
}

export function square(n: number) {
    return n * n
}

export function assertInt(n: number) {
    if (!Number.isInteger(n)) {
        throw new AssertionError("TypeError: expected int");
    }
}

export function randomInt(high: number, low?: number) {
    if (low == undefined) {
        low = 0;
    }
    assertInt(high);
    assertInt(low);
    return Math.floor(Math.random() * (high - low) + low);
}

export function rollTwoDice() {
    return randomInt(7, 1) + randomInt(7, 1) // high limit (7) is excluded
}

/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 */
export function shuffle(array: Array<any>) {
	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};
