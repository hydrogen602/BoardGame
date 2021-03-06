
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

export function onProductionServer(): boolean {
    const arr = document.URL.split('/')
    if (arr.length < 3) {
        return false;
    }
    return "game.jonathanrotter.com" == arr[2] || "projects.jonathanrotter.com" == arr[2];
}