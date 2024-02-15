import type { Validator } from './validator.js';
import { InvalidValueError } from './invalid-value.error.js';

export function objectValidator<
    T extends Record<string, any>
>(
    input: T,
    validators: {
        [K in keyof T]: Validator<T[K], T>;
    }
): T {
    const out: any = {};
    Object
        .entries(validators)
        .map(([ key, value ]) => ({
            key: key as string,
            value: value as Validator<any, T>
        }))
        .forEach(({ key, value: { expect, validate, transform } }) => {
            const value = input[key];
            const valid = validate(value, input);
            if (!valid) {
                throw new InvalidValueError(key, expect, value);
            } else {
                out[key] = transform
                    ?   transform(value, input)
                    :   value;
            }
        });

    return out;
}