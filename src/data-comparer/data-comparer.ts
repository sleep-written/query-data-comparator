import type { AnalysisResult, ChangedItem } from './interfaces/index.js';

export class DataComparer<T extends Record<string, any>, PK extends keyof T> {
    #primaryKey: PK;
    #before: T[];
    #after: T[];

    constructor(primaryKey: PK, before: T[], after: T[]) {
        this.#primaryKey = primaryKey;
        this.#before = before;
        this.#after = after;
    }

    #objectsEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) return true;
        if (obj1 instanceof Date && obj2 instanceof Date) return obj1.getTime() === obj2.getTime();
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) return false;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
            if (!keys2.includes(key) || !this.#objectsEqual(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    }

    #findDifferences(obj1: T, obj2: T): Partial<ChangedItem<T, PK>['fields']> {
        const fields: Partial<ChangedItem<T, PK>['fields']> = {};

        const compare = (value1: any, value2: any, path: string | null = null) => {
            if (value1 instanceof Date && value2 instanceof Date) {
                if (value1.getTime() !== value2.getTime()) {
                    if (path) {
                        (fields as any)[path] = { before: value1, after: value2 };
                    }
                }
            } else if (typeof value1 !== 'object' || typeof value2 !== 'object' || value1 === null || value2 === null) {
                if (value1 !== value2) {
                    if (path) {
                        (fields as any)[path] = { before: value1, after: value2 };
                    }
                }
            } else if (Array.isArray(value1) && Array.isArray(value2)) {
                if (!this.#objectsEqual(value1, value2)) {
                    if (path) {
                        (fields as any)[path] = { before: value1, after: value2 };
                    }
                }
            } else {
                Object.keys(value1).forEach(key => {
                    compare(value1[key], value2[key], path ? `${path}.${key}` : key);
                });
            }
        };

        compare(obj1, obj2);

        return fields;
    }

    runAnalysis(): AnalysisResult<T, PK> {
        const map = new Map<T[PK], { before?: T; after?: T }>();
        this.#before.forEach(item => map.set(item[this.#primaryKey], { before: item }));
        this.#after.forEach(item => {
            const entry = map.get(item[this.#primaryKey]);
            if (entry) {
                entry.after = item;
            } else {
                map.set(item[this.#primaryKey], { after: item });
            }
        });

        const results: AnalysisResult<T, PK> = { added: [], removed: [], changed: [] };
        map.forEach(({ before, after }, pk) => {
            if (before && !after) {
                results.removed.push(before);
            } else if (!before && after) {
                results.added.push(after);
            } else if (before && after && !this.#objectsEqual(before, after)) {
                const fields = this.#findDifferences(before, after);
                if (Object.keys(fields).length > 0) {
                    results.changed.push({
                        pk: {
                            key: this.#primaryKey,
                            value: pk
                        },
                        fields
                    });
                }
            }
        });

        return results;
    }
}
