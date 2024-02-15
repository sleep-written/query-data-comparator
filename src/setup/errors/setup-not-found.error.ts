export class SetupNotFoundError extends Error {
    constructor() {
        super('The file "./setup.yml" wasn\'t found');
    }
}