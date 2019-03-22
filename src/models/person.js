'use strict';

const _=require('lodash')

, CI = require("./ci")
, debug = require('../lib/debug')
;

class Person extends CI {
	
	static getCiTypeAlias() { return 'PERS' }
	
  constructor(personProps, ciTypes) {
	super(personProps, ciTypes)
	
    // this.ciTypeUuid = '';
    this.language_PERS = _.get(personProps,"language_PERS") || _.get(personProps,"language") || 'de-DE';
    this.personnelCosts_PERS = _.get(personProps,"personnelCosts_PERS") || _.get(personProps,"personnelCosts") || [];
    this.position_PERS = _.get(personProps,"position_PERS") || _.get(personProps,"position") || [];
    this.mobilePhoneNumbersBusiness_PERS = _.get(personProps,"mobilePhoneNumbersBusiness_PERS") || _.get(personProps,"mobilePhoneNumbersBusiness") || [];
    this.telephoneNumbersBusiness_PERS = _.get(personProps,"telephoneNumbersBusiness_PERS") || _.get(personProps,"telephoneNumbersBusiness") || [];
    this.personnelNumber_PERS = _.get(personProps,"personnelNumber_PERS") || _.get(personProps,"personnelNumber") || '';
    this.faxBusiness_PERS = _.get(personProps,"faxBusiness_PERS") || _.get(personProps,"faxBusiness") || '';
    this.weblinks_PERS = _.get(personProps,"weblinks_PERS") || _.get(personProps,"weblinks") || [];
    this.email_PERS = _.get(personProps,"email_PERS") || _.get(personProps,"email") || '';
    this.firstName_PERS = _.get(personProps,"firstName_PERS") || _.get(personProps,"firstName") || '';
    this.lastName_PERS = _.get(personProps,"lastName_PERS") || _.get(personProps,"lastName") || '';
    this.supervisor_PERS = _.get(personProps,"supervisor_PERS") || _.get(personProps,"supervisor") || null;
	
	if(!this.name)
		this.name=(this.firstName_PERS+" "+this.lastName_PERS);

	if(/^\s*$/.test(this.name))
		this.name=this.email_PERS

	
	//Boolean-Werte: Achtung wenn nur _.get aufgerufen wird, dann immer default bei false
	//=============
	
	this.userExisting_PERS = true
	if(_.has(personProps,"userExisting_PERS") || _.has(personProps,"userExisting")){
		this.userExisting_PERS=_.has(personProps,"userExisting_PERS") ? _.get(personProps,"userExisting_PERS") : _.get(personProps,"userExisting")
	}
    
	
	 // debug(personProps);
	  // debug(this);
  }
}

module.exports = Person;
