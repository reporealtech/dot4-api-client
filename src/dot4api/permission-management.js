'use strict';
const _ = require('lodash');

const debug = require('../lib/debug');
const BaseApi = require('./base-api');

module.exports = class PermissionManagementApi extends BaseApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'PermissionManagementApi';
  }

  async getPermissions(ciTypeId) {
    try {
      debug(`${this.name}.getPermissions(...) ...`);

      const cITypePermission = await this.dot4Client.getRequest(
        `/api/CITypePermission/${ciTypeId}`
      );

      return cITypePermission;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getPermissions("...")`);
    }
  }
  
  async updatePermissions(ciTypeId, permissionsToBeSet) {
    try {
      debug(`${this.name}.updatePermissions(...) ...`);

      const cITypePermission = await this.dot4Client.putRequest(
        `/api/CITypePermission/${ciTypeId}`
		, permissionsToBeSet
      );

      return cITypePermission;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.updatePermissions("...")`);
    }
  }
  
  
}
