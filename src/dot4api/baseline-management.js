'use strict';
const _ = require('lodash');

const debug = require('../lib/debug');
const BaseApi = require('./base-api');

module.exports = class BaselineManagementApi extends BaseApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'BaselineManagementApi';
  }
  
  async getBaselines(filter) {
	  try {
		const baselines=await this.safeDot4ClientRequest('get', `/api/baseline/dropdown`)
		if(filter){
			return _.filter(baselines,filter)
		}
		return baselines
	  } catch(e){
		  debug(`error found in ${this.name}: `+JSON.stringify(e))
	  }
  }
  
  async mismatchingBaselinesForCi(name){
	  
  }
}
