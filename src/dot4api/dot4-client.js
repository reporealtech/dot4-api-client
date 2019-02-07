'use strict';

const axios = require('axios');
const querystring = require('querystring');
const _ = require('lodash');

const debug = require('../lib/debug');
const ServiceManagementApi = require('./service-management');
const ConfigurationManagementApi = require('./configuration-management');
const IncidentManagementApi = require('./incident-management');
const PermissionManagementApi = require('./permission-management');

const MODULE_NAME = 'createDot4Client';

async function reconnect(that) {
  debug('reconnect');
  that.disconnect();
  await that.connect();
}

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

  if (_.isInteger(config.reloginTimeout)) {
    config.reloginTimeout = 1000 * 60 * 60 * 8; // 8h;
  }

  axios.defaults.baseURL = config.baseUrl;

  const _config = config;
  var _token;
  var _loginTimeout;

  let dot4Client = { isConnected: false };

  dot4Client.getVersion = async function() {
    const response = await axios.get('/api/version');
    return response.data;
  };

  dot4Client.connect = async function() {
    const loginParams = {
      grant_type: 'password',
      username: 'Dot4\\' + _config.tenant + '\\' + _config.user,
      password: _config.password
    };

    try {
      const respone = await axios.post('/token', querystring.stringify(loginParams));

      _token = respone.data;
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + _token.access_token;
      this.isConnected = true;

      _loginTimeout = setTimeout(reconnect, _config.reloginTimeout, this);
    } catch (error) {
      if (error.response) {
        throw new Error(`Connect - Status Code: ${_.get(error,"response.status")} "${_.get(error,"response.data")}"`);
      } else if (error.request) {
        throw new Error(`Connect - TimeoutStatus Code: ${_.get(error,"response.status")} "${_.get(error,"response.data")}"`);
      } else {
        throw new Error(`Connect - Error: "${_.get(error,"message")}"`);
      }
    } finally {
      debug(`createDot4Client() finished`);
    }
  };

  dot4Client.disconnect = function() {
    debug(`${MODULE_NAME}.disconnect() ...`);
    axios.defaults.headers.common['Authorization'] = '';
    _token = undefined;
    this.isConnected = false;

    if (_loginTimeout !== undefined) {
      clearTimeout(_loginTimeout);
      _loginTimeout = undefined;
    }

    debug(`${MODULE_NAME}.disconnect() finished.`);
  };

  dot4Client.request = async function(method, url, data) {
    debug(`${MODULE_NAME}.request("${method}","${url}",) ...`);
    try {
      const response = await axios({
        method,
        url,
        data
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `${method} Request ${url} - Status Code: ${error.response.status} "${JSON.stringify(
            error.response.data,
            null,
            2
          )}"`
        );
      } else if (error.request) {
        throw new Error(
          `${method} Request ${url} - TimeoutStatus Code: ${error.response.status} "${error.response.data}"`
        );
      } else {
        throw new Error(`${method} Request ${url} - Error: "${error.message}"`);
      }
    } finally {
      debug(`${MODULE_NAME}.request() finished.`);
    }
  };

  dot4Client.getRequest = async function(url) {
    return await this.request('get', url, '');
  };

  dot4Client.postRequest = async function(url, body) {
    return await this.request('post', url, body);
  };

  dot4Client.putRequest = async function(url, body) {
    return await this.request('put', url, body);
  };

  dot4Client.deleteRequest = async function(url, body) {
    return await this.request('delete', url, '');
  };

  dot4Client.createConfigurationManagementApi = async function() {
    debug(`${MODULE_NAME}.createConfigurationManagementApi() ...`);
    const configurationManagementApi = new ConfigurationManagementApi(this);
    if (_.isUndefined(this.ciTypes) || _.isUndefined(this.ciTypesTree)) {
      await configurationManagementApi.getCiTypeList();
      this.ciTypes = configurationManagementApi.ciTypes;
      this.ciTypesTree = configurationManagementApi.ciTypesTree;
    } else {
      configurationManagementApi.ciTypes = this.ciTypes;
      configurationManagementApi.ciTypesTree = this.ciTypesTree;
    }

    debug(`${MODULE_NAME}.createConfigurationManagementApi() finished.`);
    return configurationManagementApi;
  };

  dot4Client.createIncidentManagementApi = async function() {
    debug(`${MODULE_NAME}.createIncidentManagementApi() ...`);
    const incidentManagementApi = new IncidentManagementApi(this);
    if (_.isUndefined(this.ciTypes) || _.isUndefined(this.ciTypesTree)) {
      await incidentManagementApi.getCiTypeList();
      this.ciTypes = incidentManagementApi.ciTypes;
      this.ciTypesTree = incidentManagementApi.ciTypesTree;
    } else {
      incidentManagementApi.ciTypes = this.ciTypes;
      incidentManagementApi.ciTypesTree = this.ciTypesTree;
    }

    debug(`${MODULE_NAME}.createIncidentManagementApi() finished.`);
    return incidentManagementApi;
  };

  dot4Client.createServiceManagementApi = async function() {
    debug(`${MODULE_NAME}.createServiceManagementApi() ...`);
    const serviceManagementApi = new ServiceManagementApi(this);
    if (_.isUndefined(this.ciTypes) || _.isUndefined(this.ciTypesTree)) {
      await serviceManagementApi.getCiTypeList();
      this.ciTypes = serviceManagementApi.ciTypes;
      this.ciTypesTree = serviceManagementApi.ciTypesTree;
    } else {
      serviceManagementApi.ciTypes = this.ciTypes;
      serviceManagementApi.ciTypesTree = this.ciTypesTree;
    }

    debug(`${MODULE_NAME}.createServiceManagementApi() finished.`);
    return serviceManagementApi;
  };
  
  dot4Client.createPermissionManagementApi() = async function() {
    debug(`${MODULE_NAME}.createPermissionManagementApi() ...`);
    const permissionManagementApi = new PermissionManagementApi(this);
	debug(`${MODULE_NAME}.createPermissionManagementApi() finished.`);
    return permissionManagementApi;
  };
  
  return dot4Client;
}

module.exports = createDot4Client;
