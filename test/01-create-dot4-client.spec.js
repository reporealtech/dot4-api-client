'use strict';

const expect = require('chai').expect;
const mocha = require('mocha');
const config = require('./config');

const createDot4Client = require('../src/index');

let dot4Client;

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

describe('Create DOT4 Client', async () => {
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
  });

  it('dot4 get valid version', async () => {
    const version = await dot4Client.getVersion();

    expect(version).to.be.a('string');
    const versionArr = version.split('.');
    expect(versionArr).to.have.length(4);
    expect(version).match(/(\d+\.)(\d+\.)(\d+\.)(\d)/g);
  });

  it('dot4 client is connected', () => {
    expect(dot4Client.isConnected).to.equal(true);
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
