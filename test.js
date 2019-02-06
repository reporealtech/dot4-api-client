const config = require('./test/config');

const createDot4Client = require('./src/index');

(async () => {
  dot4Client = createDot4Client(config);

  await dot4Client.connect();
  incidentManagementApi = await dot4Client.createIncidentManagementApi();

  const createdComment = await incidentManagementApi.addPrivateTicketComment(1001, '"a123"');
})();
