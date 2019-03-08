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
    this.userExisting_PERS = _.get(personProps,"userExisting_PERS") || true;
    this.language_PERS = _.get(personProps,"language_PERS") || 'de-DE';
    this.personnelCosts_PERS = _.get(personProps,"personnelCosts_PERS") || [];
    this.position_PERS = _.get(personProps,"position_PERS") || [];
    this.mobilePhoneNumbersBusiness_PERS = _.get(personProps,"mobilePhoneNumbersBusiness_PERS") || [];
    this.telephoneNumbersBusiness_PERS = _.get(personProps,"telephoneNumbersBusiness_PERS") || [];
    // this.personnelNumber_PERS = '';
    this.relations = _.get(personProps,"relations") || [];
    this.weblinks_PERS = _.get(personProps,"weblinks_PERS") || [];
    this.email_PERS = _.get(personProps,"email_PERS") || '';
    this.firstName_PERS = _.get(personProps,"firstName_PERS") || '';
    this.lastName_PERS = _.get(personProps,"lastName_PERS") || '';
	this.name=_.get(personProps,"name") || (this.firstName_PERS+" "+this.lastName_PERS);

	if(/^\s*$/.test(this.name))
		this.name=this.email_PERS
  }
}

module.exports = person;
