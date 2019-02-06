'use strict';

const debug = require('../lib/debug');
const ConfigurationManagementApi = require('./configuration-management');

const UUID_CI_CATEGORY_INCIDENTS = '688da5aa-8357-4f84-a873-26a3a1646777';
const UUID_CI_TYPE_INCIDENT = '84d48ab8-a0ca-4b2b-9c89-9d5a23e15c3f';

class IncidentManagementApi extends ConfigurationManagementApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'ServiceManagementApi';
  }

  async getIncidents(query) {
    try {
      debug(`${this.name}.getServices("${JSON.stringify(query)}") ...`);

      const response = await this.getCisByCiTypeUuid(
        UUID_CI_CATEGORY_INCIDENTS
      );

      return response.items;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getServices("${JSON.stringify(query)}")`);
    }
  }

  async getIncident(id) {
    try {
      debug(`${this.name}.getIncident("${id}") ...`);

      const ciType = await this.getCiType(UUID_CI_CATEGORY_INCIDENTS);

      console.log(ciType);

      return;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getIncident("${id}")`);
    }
  }
}

module.exports = IncidentManagementApi;
