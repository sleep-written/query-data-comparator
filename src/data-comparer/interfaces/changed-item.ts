export type ChangedItem<T extends Record<string, any>, PK extends keyof T> = {
    pk: {
        key: PK;
        value: T[PK];
    };
    fields: Partial<{
        [K in keyof T]: {
            before: T[K];
            after: T[K];
        };
    }>;
};