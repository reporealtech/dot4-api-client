'use strict';
const _ = require('lodash')

, debug = require('../lib/debug')
, ConfigurationManagementApi = require('./configuration-management')
, querystring = require("querystring")
;

module.exports = class BaselineManagementApi extends ConfigurationManagementApi {
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
		// debug(baselines)
		return baselines
	  } catch(e){
		  debug(`error found in ${this.name}: `+JSON.stringify(e))
	  }
  }
  
  async execBaseline(baselineId, ciId, filter){
	  try {
		let result=_.get(await this.safeDot4ClientRequest('get', `/api/Baseline/BaselineCIs/${baselineId}`+(ciId?('?$filter='+querystring.escape('ciId eq '+ciId)):'')),'items')
		// debug(result)
		if(filter){
			result = _.filter(result,filter)
		}
		
		return ciId ? _.first(result) : result
	  } catch(e){
		  debug(`error found in ${this.name}: `+JSON.stringify(e))
	  }
  }
  
  async execAllBaselinesForCi(ci_or_ciid){
	  try{
		  if(!this.baselines)
			  this.baselines=await this.getBaselines()

		  let ci=ci_or_ciid
		  if(typeof ci_or_ciid==='string' || typeof ci_or_ciid==='number'){
			  ci=await this.getCi(ci_or_ciid)
		  }
		  const result=[]
		  
		  // debug('############### CI ##############')
		  // debug(ci)
		  // let ciType=this.getCiTypeById(ci.
		  for(let baseline of this.baselines){
			  const ciType=this.getCiType(baseline.ciTypeUuid)
			  , betroffeneIds=[ciType.id, ...ciType.parentIds]
			  // debug(betroffeneIds)
				// , ciType _.find(this.ciTypesTree, {id:ciTypeId})

			  , isThisBaselineValid=betroffeneIds.indexOf(ci.ciTypeId)>=0
			  ;
			  debug(`isThisBaselineValid: ${isThisBaselineValid}`)
			  
			  if(isThisBaselineValid){
				  const blRes=await this.execBaseline(baseline.id,ci.id)
				  blRes.baseline=baseline
				  result.push(blRes)
			  }
		  }
		  debug(result)
		  return result
	  } catch(e){
		  debug(`error found in ${this.name}: `+JSON.stringify(e))
	  }
  }
}
