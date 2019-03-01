'use strict';
const _ = require('lodash');

const debug = require('../lib/debug');
const BaseApi = require('./base-api');

module.exports = class PermissionManagementApi extends BaseApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'PermissionManagementApi';
  }
  
  async safeDot4ClientRequest(method, url, reqParams){
	//get calling function name from stack trace
	let e = new Error()
	, frame = e.stack.split("\n")[2]
	, functionName = frame.split(" ")[5];
	
	try {
		
      debug(`${functionName}(...) ...`);

      const res = await this.dot4Client[`${method.toLowerCase()}Request`](url, reqParams);

      return res;
    } catch (error) {
      throw error;
    } finally {
      debug(`${functionName}("...") finished.`);
    }
  }

  async getCITypePermissions(ciTypeId) {
	  return await this.safeDot4ClientRequest('get', `/api/CITypePermission/${ciTypeId}`)
  }
  
  async updateCITypePermissions(ciTypeId, permissionsToBeSet) {
	  return await this.safeDot4ClientRequest('put', `/api/CITypePermission/${ciTypeId}`, permissionsToBeSet)
  }
  
  async getFeatureTree(){
	   return await this.safeDot4ClientRequest('get', `/api/permission/featuretree`)
  }
  
  async getPermissionsByFeatureId(featureId) {
	  return await this.safeDot4ClientRequest('get', `/api/permission/feature/${featureId}`)
  }
  
  async updatePermissionsByFeatureId(featureId, permissions) {
	  return await this.safeDot4ClientRequest('put', `/api/permission/feature/${featureId}`, permissions)
  }
}
