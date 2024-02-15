import mssql from 'mssql';
import { readFile } from 'fs/promises';
import type { SetupData } from './setup/setup-data.js';

export class SQLRunner<T extends Record<string, any>> {
    #setupData: SetupData;

    constructor(setupData: SetupData) {
        this.#setupData = setupData;
    }

    async exec(): Promise<{ before: T[]; after: T[]; }> {
        const connection = await mssql.connect({
            server: this.#setupData.host,
            port: this.#setupData.port,
            user: this.#setupData.username,
            password: this.#setupData.password,
            database: this.#setupData.database,
            options: {
                encrypt: false
            }
        });

        try {
            const [
                queryFetch,
                queryTransact
            ] = await Promise.all([
                readFile(this.#setupData.queryFetch, 'utf-8'),
                readFile(this.#setupData.queryTransact, 'utf-8'),
            ]);
    
            const fullQuery = [
                '-- REQUEST THE DATA BEFORE THE MANIPULATION',
                `${queryFetch}\n`,
                '-- BEGIN THE TRANSACTION',
                'BEGIN TRANSACTION\n',
                '-- PERFORM THE DATA MANIPULATION',
                `${queryTransact}\n`,
                '-- REQUEST THE DATA AFTER THE MANIPULATION',
                `${queryFetch}\n`,
                '-- REVERT ALL CHANGES',
                'ROLLBACK',
            ].join('\n');
    
            const result = await connection.query(fullQuery);
            await connection.close();
    
            if (!(result.recordsets instanceof Array)) {
                throw new Error('The process executed doesn\'t launched results');
            } else {
                const [ before, after ] = result.recordsets;
                return { before, after };
            }
        } catch (err) {
            if (connection) {
                await connection.close();
            }

            throw err;
        }
    }
}