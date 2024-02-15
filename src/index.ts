import npmlog from 'npmlog';
import { Setup } from './setup/index.js';
import { SQLRunner } from './sql-runner.js';
import { DataComparer } from './data-comparer/data-comparer.js';

try {
    const setup = new Setup();
    const setupGenerated = await setup.generateSetup();
    if (setupGenerated) {
        npmlog.info('setup', `"${setup.filename}" created at "${setup.dirPath}".`);
    }
    
    const queriesGenerated = await setup.generateQueries();
    if (queriesGenerated) {
        npmlog.info('setup', `Query files created as specified in "${setup.filename}" .`);
    }
    
    if (setupGenerated || queriesGenerated) {
        npmlog.info('setup', `Now set your queries and connection options before run the program again.`);
        process.exit();
    }
    
    const setupData = await setup.load();
    npmlog.info('app', 'query fetch:   ', setupData.queryFetch);
    npmlog.info('app', 'query transact:', setupData.queryTransact);
    
    const { before, after } = await new SQLRunner(setupData).exec();
    const results = new DataComparer(setupData.primaryKey, before, after).runAnalysis();
    console.dir(results, { depth: 6 });
} catch (err: any) {
    npmlog.error('app', err?.message ?? 'Error not specified');
}