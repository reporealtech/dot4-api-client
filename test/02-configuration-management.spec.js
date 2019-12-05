/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

const expect = require('chai').expect;
const mocha = require('mocha');
const config = require('./config');

const createDot4Client = require('../src/index');

let dot4Client;
let configurationManagementApi;

describe('Create DOT4 Configuration Managment Api Client', async () => {
  before(async () => {
    dot4Client = createDot4Client(config);

    await dot4Client.connect();
    configurationManagementApi = await dot4Client.createConfigurationManagementApi();
  });

  it('Configuration Management Api has CiTypes', async () => {
    expect(configurationManagementApi.ciTypes).is.a('object');
    expect(configurationManagementApi.ciTypes).to.include.keys(
      'a63803ee-e994-42f7-b9d1-6b9f15f26540'
    ); // has Service CIType
  });

  after(async () => {
    dot4Client.disconnect();
  });
});
