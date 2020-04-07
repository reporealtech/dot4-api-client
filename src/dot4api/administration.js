/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

const _ = require('lodash');

const debug = require('../lib/debug');
const ConfigurationManagementApi = require('./configuration-management');

class AdministrationApi extends ConfigurationManagementApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'AdministrationApi';
  }

  async getRoles() {
    try {
      debug(`${this.name}.getRoles() ...`);

      const roles = this.dot4Client.getRequest('/api/roles');
      return roles;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getRoles()`);
    }
  }

  async getRole(roleId) {
    try {
      debug(`${this.name}.getRoles() ...`);

      if (!_.isInteger(roleId)) {
        throw new Error(
          `${this.name}.roleId("${roleId}"): Role id is missing.`,
        );
      }

      const role = this.dot4Client.getRequest(`/api/roles/${roleId}`);
      return role;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getRoles()`);
    }
  }

  async getDefaultPrivileges() {
    try {
      debug(`${this.name}.getDefaultPrivileges() ...`);

      const defaultPrivileges = this.dot4Client.getRequest(
        `api/Roles/DefaultPrivileges`,
      );
      return defaultPrivileges;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getDefaultPrivileges()`);
    }
  }
}

module.exports = AdministrationApi;
