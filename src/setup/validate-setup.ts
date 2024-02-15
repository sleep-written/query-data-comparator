import type { SetupData } from './setup-data.js';
import { objectValidator } from '../object-validator/object-validator.js';
import { resolve } from 'path';

export function validateSetup(data: SetupData) {
    return objectValidator(data, {
        host: {
            expect: 'localhost, url or ipv4',
            validate: v => {
                if (typeof v !== 'string') {
                    return false;
                } else if (v === 'localhost') {
                    return true;
                } else if (!!v.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/gi)) {
                    return !v
                        .split('.')
                        .map(x => parseInt(x))
                        .some(x => x < 0 || x > 255)
                } else {
                    try {
                        new URL(v);
                        return true;
                    } catch {
                        return false;
                    }
                }
            }
        },
        port: {
            expect: 'port between 1 and 99999',
            validate: v => typeof v === 'number' && v >= 1 && v <= 99999,
            transform: v => Math.trunc(v)
        },
        username: {
            expect: 'valid username',
            validate: v => typeof v === 'string' && v.trim().length > 0
        },
        password: {
            expect: 'valid password',
            validate: v => typeof v === 'string' && v.length > 0
        },
        database: {
            expect: 'valid database name',
            validate: v => typeof v === 'string' && v.trim().length > 0
        },
        primaryKey: {
            expect: 'An non empty string',
            validate: v => typeof v === 'string' && v.trim().length > 0
        },
        queryFetch: {
            expect: 'valid path',
            validate: v => typeof v === 'string',
            transform: v => resolve(v)
        },
        queryTransact: {
            expect: 'valid path',
            validate: v => typeof v === 'string',
            transform: v => resolve(v)
        },
    });
}