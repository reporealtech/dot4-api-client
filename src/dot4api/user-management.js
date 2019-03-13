'use strict';
const _ = require('lodash');

const BaseApi = require('./base-api')
, ConfigurationManagementApi = require('./configuration-management')
, debug = require('../lib/debug')
, Person = require('../models/person')
;

module.exports = class UserManagementApi extends ConfigurationManagementApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'UserManagementApi';
	// this.roleTypes= {
		// portal: 'B827D132-2866-40BB-B114-1520B3A72FFF'
	  // }
	this.roles={}
	this.asyncInitialisationsP=this.asyncInitialisations();
	this.asyncInitialisationsFinished=false
  }
  
  async asyncInitialisations(){
	  
	  //initRoles
	  const reqRoles=await this.safeDot4ClientRequest("get", '/api/roles')
	  reqRoles.forEach(e => {
        let roleTypeUuid = e.roleType.toUpperCase();
        this.roles[roleTypeUuid] = { id: e.id, name: e.name };
        // debug(` ${e.id}, name: ${e.name} } `)
      });
	  
	  this.asyncInitialisationsFinished=true
  }
  
    async updatePerson(oldUser, newUser){
		const oldPerson=new Person(oldUser)
		, newPerson=new Person(newUser)
		;
		
	   newPerson.id=oldPerson.id
	   
	   _.forEach(oldPerson, (v,k)=>{
		 if(!_.has(newPerson, k  ))
			 newPerson[k]=v;
	   })
	   
	  return await this.updateCi(newPerson)
  }
  
   async insertPerson(dot4user){
	   debug('dot4Api.createPerson');
	   
	   if(dot4user.isDeactivated) {
		   debug("won't create deactivated person")
		   return;
	   }
	   
	   if(!this.asyncInitialisationsFinished)
		   await this.asyncInitialisationsP;
	   
	   let person = new Person(dot4user)
	   , ciType=_.find(this.ciTypes, ciTypeObj => ciTypeObj.alias=='PERS')
    person.ciTypeId = ciType.id;

	let createdPerson = await this.createCi(person)
	
	//Person (nur CI) oder User (mit Login) erzeugen? => abhaengig, ob folgende Attribute null gesetzt oder gar nicht definiert.
	if(!_.has(dot4user,"userId_PERS") && !_.has(dot4user,"userExisting_PERS")
    ) {
		debug(JSON.stringify(dot4user))
		await this.assignDefaultRoles(createdPerson.userId_PERS);
	}
   
	debug(`Person [${createdPerson.email_PERS}] created.`);
	return createdPerson
  }
  
  async upsertPerson(dot4user) {
	const dot4Person=new Person(dot4user)
	, persons=await this.getCis(`email_PERS eq '${dot4Person.email_PERS}'`)

	// debug(`persons: ${persons.length}. dot4user: ${JSON.stringify(dot4user)}`)
	  if (persons.count > 0) {
		return await this.updatePerson(persons.items[0], dot4user)
	  }
	  return await this.insertPerson(dot4user)
	  
   }
   
   async assignDefaultRoles(userid) {
    let roles = [];
    // let portalRole = this.getRoleByType(this.roleTypes.portal);
    let portalRole = this.roles['B827D132-2866-40BB-B114-1520B3A72FFF'] || _.find(this.roles, roleObj => roleObj.name.toLowerCase()=='portal')
    roles.push(portalRole.id);

    await this.assignRolesforUser(userid, roles);
  }
  
  async assignRolesforUser(userid, roles) {
	  await this.safeDot4ClientRequest('put', `/api/users/${userid}/roles`, roles)
  }

  
  // getRoleByType(uuid) {
    // return this.roles[uuid.toUpperCase()];
  // }
}
