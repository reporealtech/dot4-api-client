/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

require('dotenv').config()
const debug = require('../src/lib/debug')

const config = {
  user: process.env.DOT4_USER
  , password: process.env.DOT4_PASSWORD
  , tenant: process.env.DOT4_TENANT
  , baseUrl: process.env.DOT4_BASE_URL
  , reloginTimeout: process.env.DOT4_RELOGIN_TIMEOUT || 1000 * 60 * 55 // 55min
  , saKpiRepository: {
	  url: process.env.sakpirepositoryurl
	  , apiKey: process.env.sakpirepositoryapiKey
  }
};

debug(`user: ${config.user}, tenant: ${config.tenant}, baseUrl: ${config.baseUrl}`)

module.exports = config;
