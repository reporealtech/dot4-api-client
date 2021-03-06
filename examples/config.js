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
  user: process.env.DOT4_USER || 'admin@realtech.de'
  , password: process.env.DOT4_PASSWORD || 'admin'
  , tenant: process.env.DOT4_TENANT || 'Default'
  , baseUrl: process.env.DOT4_BASE_URL || 'http://localhost:56386'
  , reloginTimeout: process.env.DOT4_RELOGIN_TIMEOUT || 1000 * 60 * 60 * 8 // 8h
  , saKpiRepository: {
	  url: process.env.sakpirepositoryurl || 'https://localhost/Default/kpirepository'
	  , apiKey: process.env.sakpirepositoryapiKey || 'e3e1b801-4ba9-4558-9582-c9a7bce9ccec_5oj4MhWT4SHY19zmTgnX9OlDNgqwdUc1VM8Gmb4kOxP4oYxDgDE9GaIcWxS6awMrRSyJEeOqUDLmN1ctxEswqOBxfkpk0GeExQGvZ3OR6MTokVBAYQsUWZvLSL5NDzyb'
  }
};

debug(`user: ${config.user}, tenant: ${config.tenant}, baseUrl: ${config.baseUrl}`)

module.exports = config;
