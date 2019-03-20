'use strict';

const _=require('lodash')

, debug = require('../lib/debug')
;

class CI {
	
	static getCiTypeAlias() { 
		debug(`ERROR: this method getCiTypeAlias() should not be called directly. It must be implemented in every sub-class of ${this.name}.`)
	}
	
	static getCiTypeAttribute(ciTypes, attrName) { 
		// debug(`calling ${this.name}.getCiTypeAttribute()`)
		let alias=this.getCiTypeAlias()
		if(alias) {
			return _.get( _.find(ciTypes, {alias}), attrName)
		} else {
			debug(`Error in ci.js => getCiTypeAttribute(${attrName}): NO ALIAS!`)
		}
	}
	
  constructor(ciProps, ciTypes) {
	  // debug(`creating object of type ${this.constructor.name}`)
	  this.ciTypeAlias=this.constructor.getCiTypeAlias() || _.get(ciProps,"ciTypeAlias"); //for example PERS, COMP, ...
	  
    this.$type = _.get(ciProps,"$type") || 'Common.DomainModels.ConfigurationMgmt.CI, Realtech.Common.DomainModels';
    this.id = _.get(ciProps,"id") || 0;
	
    this.ciTypeId = _.get(ciProps,"ciTypeId") || 0;
	if(this.ciTypeAlias && ciTypes){
		this.ciTypeId = _.get(_.find(ciTypes, {alias: this.ciTypeAlias}), "id")
	}
	// debug(`object of type ${this.constructor.name} gets ciTypeId: ${this.ciTypeId}. `)
	
    // this.ciTypeUuid = '';
    this.lifecyclePhase = _.get(ciProps,"lifecyclePhase") || 0;
    this.lifecycleStatus = _.get(ciProps,"lifecycleStatus") || 0;
	this.name=_.get(ciProps,"name")
    this.relations = _.get(ciProps,"relations") || [];
    this.description = _.get(ciProps,"description") || '';


	
	//Boolean-Werte: Achtung wenn nur _.get aufgerufen wird, dann immer default bei false
	//=============
	
	this.isDeactivated = _.has(ciProps,"isDeactivated") ? _.get(ciProps,"isDeactivated") : false;

	//Custom Properties: Zusaetzliche Attribute, insbesondere mandantenspezifische
	//=================
	if(this.ciTypeAlias){
		_.forEach(ciProps, (v,k_orig)=>{
			let k_other=k_orig
			, k_ALIAS=k_orig
			, k=k_orig
			;
			   if(k_orig.endsWith("_"+this.ciTypeAlias)){
				   k_other = k_orig.substring(0,k_orig.length-5);
				   k=k_other
			   }else{
				   k_other += "_"+this.ciTypeAlias;
				   k_ALIAS=k_other
			   }
			
			if( !_.has(this, k_orig) && !_.has(this, k_ALIAS) ){ //&& k_orig.endsWith("_PERS")
				// debug(`person.js: !has(${k_orig}), !has(${k_ALIAS}), add_PERS: ${k}=${v}. (k_orig=${k_orig})`)
				// this[k_ALIAS]=v;
				// this[k]=v;
				this[k_orig]=v;
			}
		})
	}	
	// debug(ciProps);
	 // debug(this);
  }
}

module.exports = CI;
