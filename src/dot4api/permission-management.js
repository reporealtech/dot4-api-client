'use strict';
const _ = require('lodash');

const debug = require('../lib/debug');
const BaseApi = require('./base-api');

module.exports = class PermissionManagementApi extends BaseApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'PermissionManagementApi';
  }
  
  async safeDot4ClientRequest(logName, method, url, reqParams){
	try {
      debug(`${this.name}.${logName}(...) ...`);

      const res = await this.dot4Client[`${method.toLowerCase()}Request`](url, reqParams);

      return res;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.${logName}("...")`);
    }
  }

  async getCITypePermissions(ciTypeId) {
	  return await this.safeDot4ClientRequest('getPermissions', 'get', `/api/CITypePermission/${ciTypeId}`)
  }
  
  async updateCITypePermissions(ciTypeId, permissionsToBeSet) {
	  return await this.safeDot4ClientRequest('updatePermissions', 'put', `/api/CITypePermission/${ciTypeId}`, permissionsToBeSet)
  }
  
  async getFeatureTree(){
	   return await this.safeDot4ClientRequest('getFeatureTree', 'get', `/api/permission/featuretree`)
  }
}
