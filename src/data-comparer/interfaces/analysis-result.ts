import type { ChangedItem } from './changed-item.js';

export interface AnalysisResult<T extends Record<string, any>, PK extends keyof T> {
    added: T[];
    removed: T[];
    changed: ChangedItem<T, PK>[];
}