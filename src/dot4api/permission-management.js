/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';
const _ = require('lodash');

const debug = require('../lib/debug');
const BaseApi = require('./base-api');

module.exports = class PermissionManagementApi extends BaseApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'PermissionManagementApi';
  }

  async getCITypePermissions(ciTypeId) {
    return await this.safeDot4ClientRequest(
      'get',
      `/api/CITypePermission/${ciTypeId}`,
    );
  }

  async updateCITypePermissions(ciTypeId, permissionsToBeSet) {
    return await this.safeDot4ClientRequest(
      'put',
      `/api/CITypePermission/${ciTypeId}`,
      permissionsToBeSet,
    );
  }

  async getFeatureTree() {
    return await this.safeDot4ClientRequest(
      'get',
      `/api/permission/featuretree`,
    );
  }

  async getPermissionsByFeatureId(featureId) {
    return await this.safeDot4ClientRequest(
      'get',
      `/api/permission/feature/${featureId}`,
    );
  }

  async updatePermissionsByFeatureId(featureId, permissions) {
    return await this.safeDot4ClientRequest(
      'put',
      `/api/permission/feature/${featureId}`,
      permissions,
    );
  }
};
