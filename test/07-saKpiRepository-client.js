'use strict';

const expect = require('chai').expect;
const mocha = require('mocha');
const config = require('./config');

const createDot4Client = require('../src/index');

let repoCli;

describe('Create DOT4 Service Assurance KPI Repository Client', async () => {
  before(async () => {

    repoCli = createDot4Client(config).createSaKpiRepositoryClient()
	await repoCli.login()
	
  });

  it('check token', () => {
    expect(repoCli.kpiRepToken).is.a('string');
    
  });

});
