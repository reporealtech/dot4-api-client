'use strict';

require('dotenv').config()
const debug = require('../src/lib/debug')

const config = {
  user: process.env.DOT4_USER || 'admin@realtech.de'
  , password: process.env.DOT4_PASSWORD || 'admin'
  , tenant: process.env.DOT4_TENANT || 'Yast'
  , baseUrl: process.env.DOT4_BASE_URL || 'https://vnext-api.realtech.com'
  , reloginTimeout: process.env.DOT4_RELOGIN_TIMEOUT || 1000 * 60 * 60 * 8 // 8h
  , saKpiRepository: {
	  url: process.env.sakpirepositoryurl || 'https://aiq.dot4.de/vnext/Yast/kpirepository'
	  , apiKey: process.env.sakpirepositoryapiKey || 'e3e1b801-4ba9-4558-9582-c9a7bce9ccec_5oj4MhWT4SHY19zmTgnX9OlDNgqwdUc1VM8Gmb4kOxP4oYxDgDE9GaIcWxS6awMrRSyJEeOqUDLmN1ctxEswqOBxfkpk0GeExQGvZ3OR6MTokVBAYQsUWZvLSL5NDzyb'
  }
};

debug(`user: ${config.user}, tenant: ${config.tenant}, baseUrl: ${config.baseUrl}`)

module.exports = config;
