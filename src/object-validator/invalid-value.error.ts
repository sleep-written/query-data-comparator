export class InvalidValueError extends Error {
    constructor(key: string, expected: string, actual: any) {
        super(
                `The value for the key "${key}" is invalid. `
            +   `Expected: ${expected}; `
            +   `Actual: ${JSON.stringify(actual) ?? 'null'}`
        );
    }
}