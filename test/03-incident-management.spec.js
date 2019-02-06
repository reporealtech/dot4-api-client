'use strict';

const expect = require('chai').expect;
const mocha = require('mocha');
const config = require('./config');

const createDot4Client = require('../src/index');

let dot4Client;
let incidentManagementApi;

describe('Create DOT4 Incident Managment Api Client', async () => {
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
    incidentManagementApi = await dot4Client.createIncidentManagementApi();
  });

  it('Incident Management Api has CI-Type Category Incidents', async () => {
    expect(incidentManagementApi.ciTypes).is.a('object');
    expect(incidentManagementApi.ciTypes).to.include.keys(
      '688da5aa-8357-4f84-a873-26a3a1646777'
    );
  });

  it('Incident Management Api has CI-Type Incident', async () => {
    expect(incidentManagementApi.ciTypes).is.a('object');
    expect(incidentManagementApi.ciTypes).to.include.keys(
      '84d48ab8-a0ca-4b2b-9c89-9d5a23e15c3f'
    );
  });

  it('Get all Incidents', async () => {
    const incidents = await incidentManagementApi.getIncidents();

    expect(incidents).is.a('array');
    expect(incidents).to.have.length.above(10);
  });

  it('Get all Incident 976', async () => {
    const incidents = await incidentManagementApi.getIncident(976);
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
