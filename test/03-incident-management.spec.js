'use strict';

const expect = require('chai').expect;
const mocha = require('mocha');
const faker = require('faker');

const config = require('./config');

const createDot4Client = require('../src/index');

let dot4Client;
let incidentManagementApi;
let incidentId = 0;

describe('Create DOT4 Incident Managment Api Client', async () => {
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
    incidentManagementApi = await dot4Client.createIncidentManagementApi();
  });

  it('Incident Management Api has CI-Type Category Incidents', async () => {
    expect(incidentManagementApi.ciTypes).is.a('object');
    expect(incidentManagementApi.ciTypes).to.include.keys('688da5aa-8357-4f84-a873-26a3a1646777');
  });

  it('Incident Management Api has CI-Type Incident', async () => {
    expect(incidentManagementApi.ciTypes).is.a('object');
    expect(incidentManagementApi.ciTypes).to.include.keys('84d48ab8-a0ca-4b2b-9c89-9d5a23e15c3f');
  });

  it('Get all Incidents', async () => {
    const incidents = await incidentManagementApi.getIncidents();

    expect(incidents).is.a('array');
    expect(incidents).to.have.length.above(10);
  });

  it('Get Incident id=976', async () => {
    const incidentId = 976;

    const incident = await incidentManagementApi.getIncident(incidentId);
    expect(incident.id).to.equal(incidentId);
    expect(incident).to.have.property('name');
    expect(incident).to.have.property('createdBy');
  });

  it('Create new Incident', async () => {
    const incident = {
      name: faker.hacker.phrase(),
      description: faker.lorem.lines()
    };

    const createdIncident = await incidentManagementApi.createIncident(incident);
    expect(createdIncident).to.have.property('id');
    expect(createdIncident.name).to.equal(incident.name);
    expect(createdIncident.description).to.equal(incident.description);

    incidentId = createdIncident.id;
  });

  it('Update an Incident', async () => {
    const userInfo = await dot4Client.getUserInfo();

    const incident = {
      id: incidentId,
      name: faker.hacker.phrase(),
      description: faker.lorem.lines(),
      user_SEO: userInfo.person.id
    };

    const updatedIncident = await incidentManagementApi.updateIncident(incident);
    expect(updatedIncident.id).to.equal(incidentId);
    expect(updatedIncident.name).to.equal(incident.name);
    expect(updatedIncident.description).to.equal(incident.description);
  });

  it('Add private Ticket Comment to an Incident', async () => {
    const comment = faker.hacker.phrase() + '\n' + faker.lorem.lines();

    const createdComment = await incidentManagementApi.addPrivateTicketComment(incidentId, comment);
    expect(createdComment).to.be.a('object');
  });

  it('Add public Ticket Comment to an Incident', async () => {
    const comment = faker.hacker.phrase() + '\n' + faker.lorem.lines();
    const createdComment = await incidentManagementApi.addPublicTicketComment(incidentId, comment);
    expect(createdComment).to.be.a('object');
  });

  it('Add public portal Ticket Comment to an Incident', async () => {
    const comment = faker.hacker.phrase() + '\n' + faker.lorem.lines();
    const createdComment = await incidentManagementApi.addPublicPortalTicketComment(incidentId, comment);
    expect(createdComment).to.be.a('object');
  });

  it('Get Ticket Comments of an Incident', async () => {
    const comments = await incidentManagementApi.getTicketComments(incidentId);
    expect(comments).to.be.a('array');
    expect(comments).to.have.length(3);

    expect(comments[0].isPublic).to.equal(false);
    expect(comments[0].commentType).to.equal(0);

    expect(comments[1].isPublic).to.equal(true);
    expect(comments[1].commentType).to.equal(0);

    expect(comments[2].isPublic).to.equal(true);
    expect(comments[2].commentType).to.equal(0);
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
