'use strict';

const _=require('lodash')
, assert = require('chai').assert
, faker = require('faker')

, config = require('./config')
, createDot4Client = require('../src/index')
, debug = require('../src/lib/debug')
// , Person = require('../src/models/person')
;

let dot4Client
, userManagementApi
;

describe('Call Permission API', async () => {
	const testUser=//new Person(
		{
		  firstName_PERS: faker.name.firstName()
		  , lastName_PERS: faker.name.lastName()
		  , email_PERS: faker.internet.email()
	  }//)
	  
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
    userManagementApi = await dot4Client.createUserManagementApi();
	
  });

  it('get user', async () => {
	  let users=(await userManagementApi.getCis(`email_PERS eq '${testUser.email_PERS}'`)).items
	  assert.isArray(users)
	  assert.equal(users.length, 0)
  });
  
  it('create user', async () => {
	  let user=await userManagementApi.insertPerson(testUser)
	  assert.containsAllKeys(user, ['id', "ciTypeId"])
	  testUser.id=user.id
  });

  it('update user', async () => {
	  testUser.lastName_PERS=faker.name.lastName()
	  let user=await userManagementApi.upsertPerson(testUser)
	  // debug(user)
	  assert.containsAllKeys(user, ['id', "ciTypeId"])
	  assert.propertyVal(user, 'lastName_PERS', testUser.lastName_PERS)
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
