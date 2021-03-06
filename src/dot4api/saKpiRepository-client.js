/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

let rp = require('request');
const _ = require('lodash'),
  // , axios = require('axios')
  https = require('https'),
  moment = require('moment'),
  Queue = require('better-queue'),
  uuidv4 = require('uuid/v4'),
  debug = require('../lib/debug'),
  proxyConf = require('../lib/proxyConf');

const requestQueue = new Queue(
  function (input, cb) {
    const { method, url, baseURL } = input,
      completeUrl = baseURL + url;

    debug(`SaKpiRepositoryClient.request("${method}","${url}",) ...`);

    new Promise((resolve, reject) => {
      rp(input, function (error, response, body) {
        if (error) return reject(error);

        //if(response.statusCode!=200)
        // return reject(`status: ${response.status}`)

        return resolve(body);
      });
    })
      // axios(input)
      .then((response) => {
        cb(null, response);
      })
      .catch((error) => {
        cb(
          `${method} Request ${completeUrl} - Error: ${JSON.stringify(error)}`,
        );
      });
  },
  {
    concurrent: 1,
  },
);

module.exports = class SaKpiRepositoryClient {
  constructor(config) {
    this.baseURL = _.get(config, 'saKpiRepository.url');
    this.apiKey = _.get(config, 'saKpiRepository.apiKey');

    /*		axios.defaults.httpsAgent = new https.Agent({
    			rejectUnauthorized: false
    		})

    		axios.defaults.proxy=proxyConf.axios(config)
    		axios.defaults.baseURL=this.baseURL
    */
    rp = rp.defaults({
      json: true,
      strictSSL: false,
      proxy: proxyConf.request(config),
      baseUrl: this.baseURL,
    });
  }

  request(options) {
    debug(`request to url: ${options.url}`);

    if (!_.has(options, 'headers.Authorization') && this.kpiRepToken) {
      if (!_.has(options, 'headers')) options.headers = {};
      options.headers.Authorization = 'Bearer ' + this.kpiRepToken;
    }

    return new Promise((resolve, reject) => {
      requestQueue.push(options, function (e, result) {
        if (e) {
          let errMsg = _.get(e, 'message') || _.get(e, 'response.data.error');
          if (errMsg) {
            debug(errMsg);
            return reject(errMsg);
          }
          return reject(e);
        }
        resolve(_.get(result, 'data'));
        // resolve(_.get(result,"data.data"))
      });
    });
  }

  /**
   * login to Dot4 Kpi Repository.
   */
  async login() {
    debug(
      `login to url: ${this.baseURL + '/api/token'} with apiKey: ${
        this.apiKey ? this.apiKey.substring(0, 10) : '-'
      }...`,
    );

    let kpiRepLogin = await this.request({
      method: 'post',
      url: '/api/token',
      body: {
        apiKey: this.apiKey,
      },
      // data: { apiKey:this.apiKey }
    });
    this.kpiRepToken = _.get(kpiRepLogin, 'access_token');
    debug(
      `kpiRepToken: ${
        this.kpiRepToken ? this.kpiRepToken.substring(0, 10) : '-'
      }...`,
    );

    // if(!this.allServices)
    // await this.getAllServices()
  }

  async defineCustomKpi(param) {
    debug(`define Custom Kpi [${JSON.stringify(param)}]`);

    if (_.isUndefined(_.get(param, 'name')))
      throw new Error(`you must define at least a name for your new kpi!`);

    await this.getAllKpis();
    if (_.some(this.allKpis, (kpi) => kpi.name == param.name))
      throw new Error(
        `there is already a kpi existing with the name ${param.name}!`,
      );

    let kpiAttrs = {
      uid: _.get(param, 'uid') || uuidv4(),
      name: param.name,
      label: _.get(param, 'label') || param.name,
      description:
        _.get(param, 'description') || _.get(param, 'label') || param.name,
      datatype: _.get(param, 'datatype') || 'number',
      storagetype: _.get(param, 'storagetype') || 'hour',
      isSelected: _.has(param, 'isSelected')
        ? _.get(param, 'isSelected')
        : true,
      color: _.get(param, 'color') || 'black',
      charttype: _.get(param, 'charttype') || 'line',
      aggregate: _.get(param, 'aggregate') || 'sum',
    };

    return await this.request({
      method: 'post',
      url: '/api/kpi-definition',
      body: kpiAttrs,
      // data: kpiAttrs
    });
  }

  async deleteKpi(uid) {
    debug(`delete Kpi [${uid}]`);
    return await this.request({
      method: 'delete',
      url: '/api/kpi-definition/' + uid,
    });
  }

  /**
   * load Service IDs from Dot4 Kpi Repository
   */
  async getAllServices() {
    debug('get Dot4 service IDs from dot4SaKpiRepository');
    this.allServices = await this.request({
      method: 'get',
      url: '/api/service',
    });
    debug(`loaded ${this.allServices.length} services`);
  }

  async getAllKpis() {
    debug('get KPIs from dot4SaKpiRepository');
    this.allKpis = await this.request({
      method: 'get',
      url: '/api/kpi-definition',
    });
    debug(`loaded ${this.allKpis.length} KPIs`);
    return this.allKpis;
  }

  async downloadKpis(serviceP, starttime, endtime, interval) {
    await this.getAllServices();
    await this.getAllKpis();

    const serviceUid = _.get(
      _.find(this.allServices, (o) => o.name == serviceP || o.uid == serviceP),
      'uid',
    );

    if (!serviceUid)
      return (
        'cannot download KPIs because of invalid service parameter: ' + serviceP
      );

    const params = {
      serviceUids: [serviceUid],
      starttime,
      endtime,
      interval,
    };

    /** download action */
    return await this.request({
      method: 'get',
      url: '/api/service/kpi/history-chart',
      qs: params,
      // params
    });
  }

  /**
   *
   * data=[
   *   { date: "2019-04-15", value: 4, service: "uid|name", kpi: "volumeTotal" },
   *   { date: "2019-04-15", value: 4 }
   *   { value: 4 }
   * ]
   *
   */
  async uploadKpis(data, globalServiceP, globalKpi) {
    let dataArray = data,
      customKpis = [],
      standardKpis = [],
      globalServiceUid;

    await this.getAllServices();
    await this.getAllKpis();

    if (!_.isArray(data)) dataArray = [data];

    if (globalServiceP) {
      globalServiceUid = _.get(
        _.find(
          this.allServices,
          (o) => o.name == globalServiceP || o.uid == globalServiceP,
        ),
        'uid',
      );
    }

    /**
     * remodelling of data: we need the data grouped per service
     */
    debug(`wanna upload ${_.get(dataArray, 'length')} rows`);
    _.forEach(dataArray, (dataRow) => {
      let serviceUid = globalServiceUid;
      if (dataRow.service)
        serviceUid = _.get(
          _.find(
            this.allServices,
            (o) => o.name == dataRow.service || o.uid == dataRow.service,
          ),
          'uid',
        );

      if (!serviceUid) {
        debug(
          `no dot4 service found for ${globalServiceP}, ${dataRow.service}. Skipping it for now.`,
        );
        return;
      }

      if (_.isUndefined(dataRow.value)) {
        debug(`no value set in this row. Skipping it for now.`);
        return;
      }

      let targetUploadObject = standardKpis,
        kpi = dataRow.kpi || globalKpi;
      //debug(`searching for kpi ${kpi}`)
      if (
        _.some(
          this.allKpis,
          (oneOfAllKpi) => oneOfAllKpi.name == kpi && !oneOfAllKpi.isSystem,
        )
      ) {
        targetUploadObject = customKpis;
      }

      let timestamp = moment(dataRow.date).format(),
        kpiValues = _.find(targetUploadObject, {
          timestamp,
        });

      // debug(`search in targetUploadObject[${serviceUid}] for obj with timestamp ${timestamp}`)
      if (!kpiValues) {
        kpiValues = {
          timestamp,
        };
        targetUploadObject.push(kpiValues);
        kpiValues.uid = serviceUid;
      }
      kpiValues[kpi] = dataRow.value;
    });

    /** upload action */
    let collectedPromises = [];
    if (customKpis.length) {
      // debug(JSON.stringify(customKpis))
      collectedPromises.push(
        this.request({
          method: 'post',
          url: '/api/service/customkpi-collection',
          body: {
            kpis: customKpis,
          },
          // data: { kpis: customKpis }
        }),
      );
    }
    if (standardKpis.length) {
      // debug(JSON.stringify(standardKpis))
      collectedPromises.push(
        this.request({
          method: 'post',
          url: '/api/service/kpi-collection',
          body: {
            payload: standardKpis,
          },
          // data: { payload: standardKpis }
        }),
      );
    }
    if (!collectedPromises.length) return 'nothing to upload';

    return _.flatten(await Promise.all(collectedPromises));
  }
};
