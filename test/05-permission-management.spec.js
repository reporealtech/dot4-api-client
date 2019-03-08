'use strict';

const _=require('lodash')
, assert = require('chai').assert
, traverse = require('traverse')

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

  it('get CIType permissions', async () => {
	  let permissions=await permissionManagementApi.getCITypePermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
  });
  
  it('create CIType permissions', async () => {
	  const permissionsToBeSet = [
			{
				"roleId": 1,
				"viewable": true,
				"createable": false,
				"editable": false,
				"deletable": false
			}
		]
	  
	  await permissionManagementApi.updateCITypePermissions(ciTypeIdToBeTested, permissionsToBeSet)
	  
	  let permissions=await permissionManagementApi.getCITypePermissions(ciTypeIdToBeTested)
	  assert.isArray(permissions)
	  assert.isAbove(permissions.length, 0)
	  assert.nestedProperty(permissions, '[0].roleName')
	  assert.nestedProperty(permissions, '[0].ciTypeId')
  });

  it('update CIType permissions', async () => {
	  let permissions=await permissionManagementApi.getCITypePermissions(ciTypeIdToBeTested)
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
	  
	  await permissionManagementApi.updateCITypePermissions(ciTypeIdToBeTested, changedPermissions)
	  
	  let updatedPermissions=await permissionManagementApi.getCITypePermissions(ciTypeIdToBeTested)
	  assert.isArray(updatedPermissions)
	  assert.isAbove(updatedPermissions.length, 0)
	  assert.deepEqual(updatedPermissions, changedPermissions)
  });
  
  it('get feature tree', async () => {
	  let featureTree=await permissionManagementApi.getFeatureTree()
	  assert.isArray(featureTree)
	  assert.isAbove(featureTree.length, 0)
	  
	  let allFeaturesAsFlatList=[]
	  , children=[]
	  ;
	  traverse(featureTree).forEach(function (x) {
		  if(typeof x == 'object' && x != null && !_.isArray(x)){
			allFeaturesAsFlatList.push(x)
			if(x.items)
				children.push(...x.items)
		  }
	  });
	  
	  //keine doppelten IDs
	  let gr=_.groupBy(allFeaturesAsFlatList, 'id')
	  _.forEach(gr, (arrOfPf, id) => {
		assert.isArray(arrOfPf)
		assert.lengthOf(arrOfPf, 1, `keine doppelten IDs. Folgende ist doppelt: ${id}`)
	  })
	  
	  //keine doppelten names
	  gr=_.groupBy(allFeaturesAsFlatList, 'name')
	  _.forEach(gr, (arrOfPf, name) => {
		assert.isArray(arrOfPf)
		assert.lengthOf(arrOfPf, 1, `keine doppelten names. Folgender ist doppelt: ${name}`)
	  })
	  
	  //alle elemente sollen attrs id, parentID, name und items haben
	  _.forEach(allFeaturesAsFlatList, pf => {
		  assert.containsAllKeys(pf, ['id', 'parentId', 'name', 'items'])
	  })
	  
	  //alle parentIDs auf oberster ebene null
	  gr=_.keys(_.groupBy(featureTree, 'parentId'))
	  assert.isArray(gr)
	  assert.lengthOf(gr, 1)
	  assert.equal(gr[0], "null")
	  
	  
	  //ab 2. ebene alle parentIDs ungleich null
	  let neededParentIds=_.keys(_.groupBy(children, 'parentId'))
	  assert.isArray(neededParentIds)
	  assert.notIncludeMembers(neededParentIds, [ 'null' ])
	  
	  //fuer alle eingetragenen parentIds muessen objekte existieren
	  let existingParents=_.map(featureTree, v=>`${v.id}`)
	  assert.includeMembers(existingParents, neededParentIds)
	  
	  //Irgendwo sollte es unterpunkte geben: mindestens einmal 2 Ebenen. D. h. items.length>0
	  assert.isOk(_.some(featureTree, pf => (_.get(pf,"items.length")||0)>0 ), "es gibt keine Unterpunkte.")
  });
  
   it.only('update permissions by feature ID', async () => {
	   const newPerms=[
    {
        "roleId": 1,
        "roleName": "Administrator",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": true
    },
    {
        "roleId": 2,
        "roleName": "Configuration-Analyst",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 3,
        "roleName": "Configuration-Verantwortlicher",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 4,
        "roleName": "Access-Manager",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 5,
        "roleName": "Portal",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 6,
        "roleName": "Service-Manager",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 7,
        "roleName": "Wissensmanager",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 8,
        "roleName": "Incident-Manager",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 9,
        "roleName": "Supporter",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    },
    {
        "roleId": 10,
        "roleName": "Revisor",
        "ciTypeId": 1,
        "viewable": false,
        "createable": false,
        "editable": false,
        "deletable": false
    }
];

	  let permissions=await permissionManagementApi.updatePermissionsByFeatureId(1, newPerms)
	  assert.isArray(permissions)
	  console.log(permissions)
	  _.forEach(permissions, perm=>{
		  // assert.containsAllKeys(perm, ['id', 'parentId']);
	  })
  })

  it('get permissions by feature ID', async () => {
	  let permissions=await permissionManagementApi.getPermissionsByFeatureId(1)
	  assert.isArray(permissions)
	  console.log(permissions)
	  _.forEach(permissions, perm=>{
		  // assert.containsAllKeys(perm, ['id', 'parentId']);
	  })
  })

  after(async () => {
    dot4Client.disconnect();
  });
});
