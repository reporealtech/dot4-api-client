'use strict';

const _=require('lodash')

class person {
  constructor(personProps) {
    this.$type = _.get(personProps,"$type") || 'Common.DomainModels.ConfigurationMgmt.CI, Realtech.Common.DomainModels';
    this.id = _.get(personProps,"id") || 0;
    this.ciTypeId = _.get(personProps,"ciTypeId") || 0;
    // this.ciTypeUuid = '';
    this.lifecyclePhase = _.get(personProps,"lifecyclePhase") || 0;
    this.lifecycleStatus = _.get(personProps,"lifecycleStatus") || 0;
    this.language_PERS = _.get(personProps,"language_PERS") || _.get(personProps,"language") || 'de-DE';
    this.personnelCosts_PERS = _.get(personProps,"personnelCosts_PERS") || _.get(personProps,"personnelCosts") || [];
    this.position_PERS = _.get(personProps,"position_PERS") || _.get(personProps,"position") || [];
    this.mobilePhoneNumbersBusiness_PERS = _.get(personProps,"mobilePhoneNumbersBusiness_PERS") || _.get(personProps,"mobilePhoneNumbersBusiness") || [];
    this.telephoneNumbersBusiness_PERS = _.get(personProps,"telephoneNumbersBusiness_PERS") || _.get(personProps,"telephoneNumbersBusiness") || [];
    this.personnelNumber_PERS = _.get(personProps,"personnelNumber_PERS") || _.get(personProps,"personnelNumber") || '';
    this.faxBusiness_PERS = _.get(personProps,"faxBusiness_PERS") || _.get(personProps,"faxBusiness") || '';
    this.relations = _.get(personProps,"relations") || [];
    this.description = _.get(personProps,"description") || '';
    this.weblinks_PERS = _.get(personProps,"weblinks_PERS") || _.get(personProps,"weblinks") || [];
    this.email_PERS = _.get(personProps,"email_PERS") || _.get(personProps,"email") || '';
    this.firstName_PERS = _.get(personProps,"firstName_PERS") || _.get(personProps,"firstName") || '';
    this.lastName_PERS = _.get(personProps,"lastName_PERS") || _.get(personProps,"lastName") || '';
	
	this.name=_.get(personProps,"name") || (this.firstName_PERS+" "+this.lastName_PERS);

	if(/^\s*$/.test(this.name))
		this.name=this.email_PERS

	
	//Boolean-Werte: Achtung wenn nur _.get aufgerufen wird, dann immer default bei false
	//=============
	
	this.userExisting_PERS = true
	if(_.has(personProps,"userExisting_PERS") || _.has(personProps,"userExisting")){
		this.userExisting_PERS=_.get(personProps,"userExisting_PERS") || _.get(personProps,"userExisting")
	}
    
	this.isDeactivated = _.has(personProps,"isDeactivated") ? _.get(personProps,"isDeactivated") : false;
	
  }
}

module.exports = person;
