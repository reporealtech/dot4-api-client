'use strict';

require('dotenv').config()
const debug = require('../src/lib/debug')

const config = {
  user: process.env.DOT4_USER || 'admin@realtech.de'
  , password: process.env.DOT4_PASSWORD || 'admin'
  , tenant: process.env.DOT4_TENANT || 'Yast'
  , baseUrl: process.env.DOT4_BASE_URL || 'https://vnext-api.realtech.com'
  , reloginTimeout: process.env.DOT4_RELOGIN_TIMEOUT || 1000 * 60 * 60 * 8 // 8h
};

debug(`user: ${config.user}, tenant: ${config.tenant}, baseUrl: ${config.baseUrl}`)

module.exports = config;
