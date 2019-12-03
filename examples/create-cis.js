'use strict';

const unknownHardwareGuid = '101FCFEE-446B-4EB1-94C2-8D2DED28E0B6';

const ciTypeuuid = unknownHardwareGuid;
const ciCount = 1000;

const config = require('./config');
const createDot4Client = require('../src/index');

(async () => {
    try {
        const dot4Client = createDot4Client(config);
        await dot4Client.connect();
        const version = await dot4Client.getVersion();
        console.log(`Dot4 version: ${version}`);
        const configurationMgmt = await dot4Client.createConfigurationManagementApi();
        console.log(`Create ${ciCount} CIs ...`);
        for (let i = 0; i < ciCount; ++i) {
            const ciName = `Test ${i}`;
            await configurationMgmt.createCi({ name: ciName }, ciTypeuuid);
        }

        console.log(`${ciCount} CIs created.`);
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
