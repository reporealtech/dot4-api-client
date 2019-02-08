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
    permissionManagementApi = dot4Client.createPermissionManagementApi();
  });

  it('get permissions', async () => {
	  let permissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
  });
  
  it('create permissions', async () => {
	  const permissionsToBeSet = [
			{
				"roleId": 1,
				"viewable": true,
				"createable": false,
				"editable": false,
				"deletable": false
			}
		]
	  
	  await permissionManagementApi.updatePermissions(ciTypeIdToBeTested, permissionsToBeSet)
	  
	  let permissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
	  assert.isAbove(permissions.length, 0)
	  assert.nestedProperty(permissions, '[0].roleName')
	  assert.nestedProperty(permissions, '[0].ciTypeId')
  });

  it('update permissions', async () => {
	  let permissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
	  assert.isAbove(permissions.length, 0)
	  
	  let changedPermissions=JSON.parse(JSON.stringify(permissions))
	  changedPermissions[0].viewable=!permissions[0].viewable
	  if(permissions.length>1)
		changedPermissions[1].createable=!permissions[1].createable
	  if(permissions.length>1)
		  changedPermissions[2].editable=!permissions[2].editable
	  if(permissions.length>2)
		  changedPermissions[3].deletable=!permissions[3].deletable
	  
	  await permissionManagementApi.updatePermissions(ciTypeIdToBeTested, changedPermissions)
	  
	  let updatedPermissions=await permissionManagementApi.getPermissions(ciTypeIdToBeTested)
	  assert.isArray(updatedPermissions)
	  assert.isAbove(updatedPermissions.length, 0)
	  assert.deepEqual(updatedPermissions, changedPermissions)
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
