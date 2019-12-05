/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

const config = require('./test/config');

const createDot4Client = require('./src/index');

(async () => {
  dot4Client = createDot4Client(config);

  await dot4Client.connect();
  incidentManagementApi = await dot4Client.createIncidentManagementApi();

  const createdComment = await incidentManagementApi.addPrivateTicketComment(1001, '"a123"');
})();
