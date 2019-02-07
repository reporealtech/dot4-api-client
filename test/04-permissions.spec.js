'use strict';

const _=require('lodash')
, assert = require('chai').assert
, config = require('./config')

, createDot4Client = require('../src/index')
;

let dot4Client
, permissionManagementApi
;
const ciTypeIdToBeTested=1

describe('Call Permission API', async () => {
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
    permissionManagementApi = await dot4Client.createPermissionManagementApi();
  });

  it('get permissions', async () => {
	  let permissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
  });
  
  it('create permissions', async () => {
	  let permissionsToBeSet = [
			{
				"roleId": 1,
				"roleName": "Administrator",
				"ciTypeId": 1,
				"viewable": true,
				"createable": false,
				"editable": false,
				"deletable": false
			}
		]
	  
	  await permissionManagementApi.updatePermissions(ciTypeIdToBeTested, permissionsToBeSet)
	  
	  let permissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
  });

  it('update permissions', async () => {
	  let permissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
	  
	  let changedPermissions=_.clone(permissions)
	  changedPermissions[0].viewable=!permissions[0].viewable
	  changedPermissions[1].createable=!permissions[1].createable
	  changedPermissions[2].editable=!permissions[2].editable
	  changedPermissions[3].deletable=!permissions[3].deletable
	  
	  await permissionManagementApi.updatePermissions(ciTypeIdToBeTested, changedPermissions)
	  
	  let updatedPermissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(updatedPermissions)
	  assert.equal(updatedPermissions[0].viewable, changedPermissions[0].viewable)
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
