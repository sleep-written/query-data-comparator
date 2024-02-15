export interface Validator<T, O> {
    expect: string;
    validate:  (v: T, input: O) => boolean;
    transform?: (v: T, input: O) => T;
}