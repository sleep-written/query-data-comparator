import test from 'ava';
import { objectValidator } from '../object-validator.js';

const validators = {
    min: {
        expect: 'v >= 0',
        validate: (v: number, o: { max: number; }) => (
            typeof v === 'number' &&
            v >= 0
        )
    },
    max: {
        expect: 'v >= 0 && this.max >= this.min',
        validate: (v: number, o: { min: number; }) => (
            typeof v === 'number' &&
            v >= o.min &&
            v >= 0
        )
    }
}

test('Success', t => {
    const resp = objectValidator(
        {
            min: 5,
            max: 12
        },
        validators
    );

    t.deepEqual(resp, {
        min: 5,
        max: 12
    });
});

test('Fail "min"', t => {
    t.throws(
        () => objectValidator(
            {
                min: -88,
                max: 12
            },
            validators
        ),
        {
            message:
                    `The value for the key "min" is invalid. Expected: `
                +   `v >= 0; Actual: -88`

        }
    )
});

test('Fail "max"', t => {
    t.throws(
        () => objectValidator(
            {
                min: 5,
                max:-88
            },
            validators
        ),
        {
            message:
                    `The value for the key "max" is invalid. Expected: `
                +   `v >= 0 && this.max >= this.min; Actual: -88`

        }
    )
});