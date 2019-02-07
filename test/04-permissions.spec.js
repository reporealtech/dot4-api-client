'use strict';

const assert = require('chai').assert;
const config = require('./config');

const createDot4Client = require('../src/index');

let dot4Client;
let permissionManagementApi;

describe('Call Permission API', async () => {
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
    permissionManagementApi = await dot4Client.createPermissionManagementApi();
  });

  it('get permissions', async () => {
	  assert.isObject(permissionManagementApi.ciTypes)
  });
  
  it('create permissions', async () => {
	  assert.isObject(permissionManagementApi.ciTypes)
  });

  it('get permissions', async () => {
	  assert.isObject(permissionManagementApi.ciTypes)
  });

  it('update permissions', async () => {
	  assert.isObject(permissionManagementApi.ciTypes)
  });

  it('get permissions', async () => {
	  assert.isObject(permissionManagementApi.ciTypes)
  });

  it('delete permissions', async () => {
	  assert.isObject(permissionManagementApi.ciTypes)
  });

  it('get permissions', async () => {
	  assert.isObject(permissionManagementApi.ciTypes)
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
