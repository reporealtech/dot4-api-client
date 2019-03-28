'use strict';
const _ = require('lodash')
;

const BaseApi = require('./base-api')
, ConfigurationManagementApi = require('./configuration-management')
, debug = require('../lib/debug')
, Person = require('../models/person')
, Company = require('../models/company')
, Department = require('../models/department')
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
		if(!newUser)
			newUser=oldUser;
		
		// debug("oldUser")
		// debug(oldUser)
		const oldPerson=new Person(oldUser, this.ciTypes)
		, newPerson=new Person(newUser, this.ciTypes)
		;
	   newPerson.id=oldPerson.id

	   _.forEach(oldPerson, (v,k_orig)=>{
		   let k_other=k_orig;
		   if(k_orig.endsWith("_PERS"))
			   k_other = k_orig.substring(0,k_orig.length-5);
		   else
			   k_other += "_PERS";
		 if(!_.has(newUser, k_orig) && !_.has(newUser, k_other)){ //hier muss newUser genommen werden, da newPerson Default-Werte gesetzt hat
			// debug(`user-management.js: add key ${k_orig} and value ${v}`)
			 newPerson[k_orig]=v;
		 }
	   })
	   
	   //dafuer sorgen, dass keine ungueltigen props eingetragen sind
	   _.forEach(newPerson, (v,k)=>{
		   if(!_.has(oldPerson,k))
			   delete newPerson[k]
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
	   
	   let person = new Person(dot4user, this.ciTypes)
	   

	let createdPerson = await this.createCi(person)
	
	//Person (nur CI) oder User (mit Login) erzeugen? => abhaengig, ob folgende Attribute null gesetzt oder gar nicht definiert.
	if(!_.has(dot4user,"userId_PERS") && !_.has(dot4user,"userExisting_PERS")
    ) {
		// debug(JSON.stringify(dot4user))
		await this.assignDefaultRoles(createdPerson.userId_PERS);
	}
   
	debug(`Person [${createdPerson.email_PERS}] created.`);
	return createdPerson
  }
  
  async upsertPerson(dot4user) {
	const dot4Person=new Person(dot4user, this.ciTypes)
	// , persons=_.get(await this.getCis(`email_PERS eq '${dot4Person.email_PERS}'`),'items')
	, persons=await this.getCis(`email_PERS eq '${dot4Person.email_PERS}'`)

	// debug(dot4user)
	// debug(`persons: ${persons.length}. ${JSON.stringify(persons)}`)
	// debug(`dot4user: ${JSON.stringify(dot4user)}`)
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
	  debug(`assignRolesforUser(${userid})`)
	  await this.safeDot4ClientRequest('put', `/api/users/${userid}/roles`, roles)
  }

  async loadAllUsers(){
	  debug("loadAllUsers()")
	  return await this.loadAllCisForFilter(`ciTypeId eq ${Person.getCiTypeAttribute(this.ciTypes, 'id')}`,{ciTypeName: Person.getCiTypeAttribute(this.ciTypes, 'name')})
  }
 
 async createDepartment(c) {
	  debug(`createDepartment(${c.name})`)
	return await this.createCi(new Department(c, this.ciTypes))
  }
 
  async loadAllDepartments() {
	  debug("loadAllDepartments()")
	  return await this.loadAllCisForFilter(`ciTypeId eq ${Department.getCiTypeAttribute(this.ciTypes, 'id')}`,{ciTypeName: Department.getCiTypeAttribute(this.ciTypes, 'name')})
  }
  
  async createCompany(c) {
	  debug(`createCompany(${c.name})`)
	return await this.createCi(new Company(c, this.ciTypes))
  }
  
  async loadAllCompanies() {
	  debug("loadAllCompanies()")
	  return await this.loadAllCisForFilter(`ciTypeId eq ${Company.getCiTypeAttribute(this.ciTypes, 'id')}`,{ciTypeName: Company.getCiTypeAttribute(this.ciTypes, 'name')})
  }
  
}
