'use strict';

const expect = require('chai').expect;
const mocha = require('mocha');
const faker = require('faker');
const _ = require('lodash');

const config = require('./config');

const createDot4Client = require('../src/index');

let dot4Client;
let administrationApi;

describe('Create DOT4 Administration Api Client', async () => {
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
    administrationApi = await dot4Client.createAdministrationApi();
  });

  it('AdministrationApi Object created', async () => {
    expect(administrationApi).is.a('object');
    expect(administrationApi.getRoles).is.a('function');
  });

  it('Get all Roles', async () => {
    const roles = await administrationApi.getRoles();
    expect(roles).is.a('array');
    expect(roles).have.length.above(10);
  });

  it.only('Get Role', async () => {
    const roles = await administrationApi.getRoles();
    const roleToGet = _.filter(roles, { name: 'Administrator' })[0];
    const role = await administrationApi.getRole(roleToGet.id);
    expect(role).is.a('object');
    expect(role.id).is.equal(roleToGet.id);
    expect(role.name).is.equal('Administrator');
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
