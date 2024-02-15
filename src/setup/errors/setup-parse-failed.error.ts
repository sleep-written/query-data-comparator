export class SetupParseFailedError extends Error {
    constructor() {
        super('The file "./setup.yml" cannot be parsed.');
    }
}