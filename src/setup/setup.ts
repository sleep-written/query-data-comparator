import type { SetupData } from './setup-data.js';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { resolve, parse as pathParse, basename } from 'path';
import * as yaml from 'yaml';

import { SetupParseFailedError, SetupNotFoundError } from './errors/index.js';
import { InvalidValueError } from '@/object-validator/invalid-value.error.js';
import { validateSetup } from './validate-setup.js';

export class Setup {
    #path = resolve('./setup.yml');
    get path(): string {
        return this.#path;
    }

    get dirPath(): string {
        return pathParse(this.path).dir;
    }

    get filename(): string {
        return basename(this.path);
    }

    async #exists(path: string): Promise<boolean> {
        try {
            await access(path);
            return true;
        } catch {
            return false;
        }
    }

    async #writeFile(path: string, text: string, ...extraLines: string[]): Promise<void> {
        const folderPath = pathParse(path).dir;
        if (!await this.#exists(folderPath)) {
            await mkdir(folderPath, { recursive: true });
        }

        const raw = [ text, ...extraLines ].join('\n');
        return writeFile(path, raw, 'utf-8');
    }

    async exists(): Promise<boolean> {
        return this.#exists(this.path);
    }

    async load(): Promise<SetupData> {
        if (!await this.#exists(this.path)) {
            throw new SetupNotFoundError();
        }

        try {
            const text = await readFile(this.path, 'utf-8');
            const data = yaml.parse(text) as SetupData;
            return validateSetup(data);
        } catch (err: any) {
            if (err instanceof InvalidValueError) {
                throw err;
            } else {
                throw new SetupParseFailedError();
            }
        }
    }

    async generateSetup(): Promise<boolean> {
        if (!await this.#exists(this.path)) {
            await this.#writeFile(
                this.path,
                'host: 127.0.0.1',
                'port: 1433',
                'username: -- PUT HERE YOUR DB USERNAME --',
                'password: -- PUT HERE YOUR DB PASSWORD --',
                'database: -- PUT HERE YOUR DB NAME --',
                '',
                'primaryKey:     -- YOUR PK IN YOUR QUERY --',
                'queryFetch:     ./queries/fetch.sql',
                'queryTransact:  ./queries/transact.sql',
            );
            return true;
        } else {
            return false;
        }
    }

    async generateQueries(): Promise<boolean> {
        let generated = false;
        const data = await this.load();
        if (!await this.#exists(data.queryFetch)) {
            generated = true;
            await this.#writeFile(
                data.queryFetch,
                '-- PUT YOUR SQL QUERY HERE TO FETCH YOUR DATA'
            );
        }
        
        if (!await this.#exists(data.queryTransact)) {
            generated = true;
            await this.#writeFile(
                data.queryTransact,
                '-- PUT YOUR SQL QUERY HERE TO PERMORM A DATA MANIPULATION TRANSACTION'
            );
        }

        return generated;
    }
}