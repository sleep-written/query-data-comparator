import test from 'ava';
import { objectValidator } from '../object-validator.js';

const validations = {
    text: {
        expect: 'text longer than 0',
        validate: (v: string) => v.length > 0
    },
    value: {
        expect: 'integer between 0 to 99999',
        validate: (v: number) => v >= 0 && v <= 99999,
        transform: (v: number) => Math.trunc(v)
    }
};

test('Success', t => {
    const response = objectValidator(
        {
            text: 'joder',
            value: 555.88
        },
        validations
    );

    t.deepEqual(response, {
        text: 'joder',
        value: 555
    });
});

test('Fail "text"', t => {
    t.throws(
        () => objectValidator(
            {
                text: '',
                value: 555.88
            },
            validations
        ),
        {
            message:
                    `The value for the key "text" is invalid. `
                +   `Expected: text longer than 0; Actual: ""`
        }
    )
});

test('Fail "value"', t => {
    t.throws(
        () => objectValidator(
            {
                text: 'ñeeeee',
                value: -666
            },
            validations
        ),
        {
            message:
                    `The value for the key "value" is invalid. `
                +   `Expected: integer between 0 to 99999; Actual: -666`
        }
    )
});