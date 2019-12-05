/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

/**
 * A module for creating a DOT4 API Client.
 * @module dot4-client
 * @example
 * const createDot4Client = require('dot4-api-client')
 */

const axios = require('axios')
, Queue = require('better-queue')
, querystring = require('querystring')
, _ = require('lodash')

, debug = require('../lib/debug')
, proxyConf = require('../lib/proxyConf')
, ServiceManagementApi = require('./service-management')
, ConfigurationManagementApi = require('./configuration-management')
, IncidentManagementApi = require('./incident-management')
, PermissionManagementApi = require('./permission-management')
, UserManagementApi = require('./user-management')
, AdministrationApi = require('./administration')
, SaKpiRepositoryClient = require("./saKpiRepository-client")
, BaselineManagementApi= require("./baseline-management")
, MODULE_NAME = 'createDot4Client'
;

async function reconnect(that) {
  debug('reconnect');
  that.disconnect();
  await that.connect();
}

const requestQueue = new Queue(function (input, cb) {
	let {method, url, data, _token}=input
	debug(`${MODULE_NAME}.request("${method}","${url}",) ...`);

	const headers = {
	  'content-type': 'application/json',
	  Authorization: 'Bearer ' + _.get(_token,"access_token")
	};
	
	axios({
		method,
		url,
		data,
		headers
	  })
	.then(response=>{
		// debug(`####### response! statusCode: ${response.status}, error: ${response.error}`)
		cb(null, response.data);
	})
	.catch(error=>{
		cb(`${method} request to ${url} failed. Error: "${error}"`); //JSON.stringify(): TypeError: Converting circular structure to JSON
	})

}, { concurrent: 1 })

/**
 * The main dot4 Client Creation function
 * @param {object} - configuration object for connecting to the dot4 api
 * @returns {dot4client} returns an dot4 api client object
 * @example
Create an dot4 api client with a given configuration and connnect it
```javascript
const createDot4Client = require('dot4-api-client');
const config = {
  user: 'admin@realtech.de',
  password: 'admin',
  tenant: 'Default',  
};

const dot4Client = createDot4Client(config);
await dot4Client.connect();
```
 */
function createDot4Client(config) {
  debug(`createDot4Client()...`);
  if (!config) {
    throw new Error('dot4Client::config is missing');
  }

  if (!config.tenant || !config.tenant.length === 0) {
    throw new Error('dot4Client::config.tenant is missing');
  }

  if (!config.user || !config.user.length === 0) {
    throw new Error('dot4Client::config.user is missing');
  }
  if (!config.password || !config.password.length === 0) {
    throw new Error('dot4Client::config.password is missing');
  }

  if (!config.baseUrl || !config.baseUrl.length === 0) {
    config.baseUrl = 'https://api.dot4.de';
  }

  if (!_.isInteger(config.reloginTimeout) || config.reloginTimeout<120*1000) {
    config.reloginTimeout = 1000 * 60 * 60 * 8; // 8h;
  }

  axios.defaults.baseURL = config.baseUrl;
  axios.defaults.proxy=proxyConf.axios(config)

  const _config = config;
  // var _token;
  var _loginTimeout;

  let dot4Client = { 
	isConnected: false 
  };

  dot4Client.getVersion = async function() {
    return await this.getRequest('/api/version');
  };

  dot4Client.getUserInfo = async function() {
    debug(`${MODULE_NAME}.getUserInfo() ...`);
    const userInfo = await this.getRequest('/api/userinfo');

    debug(`${MODULE_NAME}.getUserInfo() finished.`);
    return userInfo;
  };

  dot4Client.connect = async function() {
    const loginParams = {
      grant_type: 'password',
      username: (_.get(_config,'module')||'Dot4')+'\\' + _config.tenant + '\\' + _config.user,
      password: _config.password
    };

    try {
      // const response = await axios.post('/token', querystring.stringify(loginParams));
      // _token = response.data;
	  this._token = await this.postRequest('/token', querystring.stringify(loginParams));
      
      // axios.defaults.headers.common['Authorization'] = 'Bearer ' + _token.access_token;
      this.isConnected = true;

      _loginTimeout = setTimeout(reconnect, _config.reloginTimeout, this);
    } catch (error) {
      if (error.response) {
        throw new Error(`Connect - Status Code: ${_.get(error,"response.status")} "${JSON.stringify(_.get(error,"response.data"))}"`);
      } else if (error.request) {
        throw new Error(`Connect - TimeoutStatus Code: ${_.get(error,"response.status")} "${JSON.stringify(_.get(error,"response.data"))}"`);
      } else {
        throw new Error(`Connect - Error: "${JSON.stringify(error.message || error.stack || error)}"`);
      }
    } finally {
      debug(`createDot4Client() finished`);
    }
  };

  dot4Client.disconnect = function() {
    debug(`${MODULE_NAME}.disconnect() ...`);
    // axios.defaults.headers.common['Authorization'] = '';
    this._token = undefined;
    this.isConnected = false;

    if (_loginTimeout !== undefined) {
      clearTimeout(_loginTimeout);
      _loginTimeout = undefined;
    }

    debug(`${MODULE_NAME}.disconnect() finished.`);
  };

  dot4Client.request = function(method, url, data) {
	  const that=this
	  return new Promise((resolve, reject)=>{
		  requestQueue.push({method, url, data, _token: that._token}, function (err, result) {
			  if(err)
				  return reject(err)
			  resolve(result)
  		  });
	  })
  }
    
  

  dot4Client.getRequest = async function(url) {
    return await this.request('get', url, '');
  };

  dot4Client.postRequest = async function(url, body) {
    return await this.request('post', url, body);
  };

  dot4Client.putRequest = async function(url, body) {
    return await this.request('put', url, body);
  };

  dot4Client.deleteRequest = async function(url) { //, body
    return await this.request('delete', url); //, body
  };
  
  dot4Client.setCiTypes = async function(api) {
	  if (_.isUndefined(this.ciTypes) || _.isUndefined(this.ciTypesTree)) {
      await api.getCiTypeList();
      this.ciTypes = api.ciTypes;
      this.ciTypesTree = api.ciTypesTree;
    } else {
      api.ciTypes = this.ciTypes;
      api.ciTypesTree = this.ciTypesTree;
    }
	// debug(`--1 ${_.keys(api.ciTypes)}`)
  }

  dot4Client.createConfigurationManagementApi = async function() {
    debug(`${MODULE_NAME}.createConfigurationManagementApi() ...`);
    const configurationManagementApi = new ConfigurationManagementApi(this);
    await dot4Client.setCiTypes(configurationManagementApi)

    debug(`${MODULE_NAME}.createConfigurationManagementApi() finished.`);
    return configurationManagementApi;
  };

  dot4Client.createIncidentManagementApi = async function() {
    debug(`${MODULE_NAME}.createIncidentManagementApi() ...`);
    const incidentManagementApi = new IncidentManagementApi(this);
    await dot4Client.setCiTypes(incidentManagementApi)

    debug(`${MODULE_NAME}.createIncidentManagementApi() finished.`);
    return incidentManagementApi;
  };

  dot4Client.createServiceManagementApi = async function() {
    debug(`${MODULE_NAME}.createServiceManagementApi() ...`);
    const serviceManagementApi = new ServiceManagementApi(this);
    await dot4Client.setCiTypes(serviceManagementApi)

    debug(`${MODULE_NAME}.createServiceManagementApi() finished.`);
    return serviceManagementApi;
  };
  
  dot4Client.createBaselineManagementApi = async function() {
    debug(`${MODULE_NAME}.createBaselineManagementApi() ...`);
    const baselineManagementApi = new BaselineManagementApi(this);
    await dot4Client.setCiTypes(baselineManagementApi)

    debug(`${MODULE_NAME}.createBaselineManagementApi() finished.`);
    return baselineManagementApi;
  };
  
  dot4Client.createPermissionManagementApi = function() {
    debug(`${MODULE_NAME}.createPermissionManagementApi() ...`);
    const permissionManagementApi = new PermissionManagementApi(this);
	debug(`${MODULE_NAME}.createPermissionManagementApi() finished.`);
    return permissionManagementApi;
  };
  
  dot4Client.createUserManagementApi = async function() {
    debug(`${MODULE_NAME}.createUserManagementApi() ...`);
    const userManagementApi = new UserManagementApi(this);
	await dot4Client.setCiTypes(userManagementApi)
	debug(`${MODULE_NAME}.createUserManagementApi() ciTypes: ${_.keys(userManagementApi.ciTypes).length}.`);
	debug(`${MODULE_NAME}.createUserManagementApi() finished.`)
    return userManagementApi;
  };
  
  dot4Client.createAdministrationApi = async function() {
    debug(`${MODULE_NAME}.createAdministrationApi() ...`);
    const administrationApi = new AdministrationApi(this);
    await dot4Client.setCiTypes(administrationApi)

    debug(`${MODULE_NAME}.createAdministrationApi() finished.`)
    return administrationApi;
  };
  
  dot4Client.createSaKpiRepositoryClient = function() {
	  return new SaKpiRepositoryClient(config)
  }

  return dot4Client;
}

module.exports = createDot4Client;
