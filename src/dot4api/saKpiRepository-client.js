'use strict';

const _ = require('lodash')
, axios = require('axios')
, Queue = require('better-queue')
, https = require('https')
, moment= require("moment")
, uuidv4 = require('uuid/v4');
;

const debug = require('../lib/debug');

const requestQueue = new Queue(function (input, cb) {
	let {method, url}=input
	debug(`SaKpiRepositoryClient.request("${method}","${url}",) ...`);

	axios(input)
	.then(response=>{
		cb(null, response);
	})
	.catch(error=>{
		if (error.response) {
			cb(
			  `${method} Request ${url} - Status Code: ${error.response.status} "${JSON.stringify(
				error.response.data,
				null,
				2
			  )}"`
			);
		} else if (error.request) {
			cb(
			  `${method} Request ${url} - TimeoutStatus Code: ${error.response.status} "${error.response.data}"`
			);
		} else {
			cb(`${method} Request ${url} - Error: "${error.message}"`);
		}
	})

}, { concurrent: 1 })


module.exports = class SaKpiRepositoryClient {
	constructor(config) {
		this.baseURL=config.url
		this.apiKey=config.apiKey
		this.httpsAgent = new https.Agent({  
			rejectUnauthorized: false
		})
	}
	
	request(options){
		debug(`request to url: ${options.url}`)
		return new Promise((resolve, reject)=>{
		  requestQueue.push(options, function (e, result) {
			  if(e){
				let errMsg=_.get(e,"response.data.error")
				if(errMsg){
					debug(errMsg)
					return reject(errMsg)
				}
				return reject(e)
			  }
			  resolve(_.get(result,"data.data"))
  		  });
	    })
	}
	
	/**
	 * login to Dot4 Kpi Repository. 
	 */
	async login() {
		debug(`login to url: ${this.baseURL+'/api/token'} with apiKey: ${this.apiKey?this.apiKey.substring(0,10):'-'}...`)
		let kpiRepLogin=await this.request({ 
		  httpsAgent: this.httpsAgent,
		  method: 'post',
		  baseURL: this.baseURL,
		  url: '/api/token',
		  rejectUnauthorized: false,
		  data: 
		   { apiKey:this.apiKey }
		})
		this.kpiRepToken=_.get(kpiRepLogin,"access_token")
		debug(`kpiRepToken: ${this.kpiRepToken?this.kpiRepToken.substring(0,10):'-'}...`)
		
		// if(!this.allServices)
			// await this.getAllServices()
		
	}
	
	async defineCustomKpi(param) {
		debug(`define Custom Kpi [${JSON.stringify(param)}]`)
		
		if (_.isUndefined(_.get(param, "name"))) 
			throw new Error(`you must define at least a name for your new kpi!`);
		
		await this.getAllKpis()
		if(_.some(this.allKpis, kpi=>kpi.name==param.name))
			throw new Error(`there is already a kpi existing with the name ${param.name}!`);
		
		let kpiAttrs={
			"uid": _.get(param, "uid") || uuidv4(),
			"name": param.name,
			"label": _.get(param, "label") ||  param.name,
			"description": _.get(param, "description") || param.name,
			"datatype": _.get(param, "datatype") || "number",
			"storagetype": _.get(param, "storagetype") || "hour",
			"isSelected": _.has(param, "isSelected") ? _.get(param, "isSelected") : true,
			"color": _.get(param, "color") || "black",
			"charttype": _.get(param, "charttype") || "line",
			"aggregate": _.get(param, "aggregate") || "sum"
		}
		
		return await this.request({ 
			method: 'post',
			httpsAgent: this.httpsAgent,
			baseURL: this.baseURL,
			url: '/api/kpi-definition',
			headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
			data: kpiAttrs
		})
	}
	
	/**
	 * load Service IDs from Dot4 Kpi Repository
	 */
	async getAllServices(){
		debug("get Dot4 service IDs from dot4SaKpiRepository")
		this.allServices=await this.request({ 
		  method: 'get',
		  httpsAgent: this.httpsAgent,
		  baseURL: this.baseURL,
		  url: '/api/service',
		  headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
		})
		debug(`loaded ${this.allServices.length} services`)
	}
	
	async getAllKpis(){
		debug("get KPIs from dot4SaKpiRepository")
		this.allKpis=await this.request({ 
		  method: 'get',
		  httpsAgent: this.httpsAgent,
		  baseURL: this.baseURL,
		  url: '/api/kpi-definition',
		  headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
		})
		debug(`loaded ${this.allKpis.length} KPIs`)
	}
	
	/**
	 *
	 * data=[
	 *   { date: "2019-04-15", value: 4, service: "uid|name", kpi: "volumeTotal" },
	 *   { date: "2019-04-15", value: 4 }
	 * ]
	 *
	 */
	async uploadKpis(data, globalServiceP, globalKpi){
		let dataArray=data
		, customKpis=[]
		, standardKpis=[]
		, globalServiceUid
		;
		
		await this.getAllServices()
		await this.getAllKpis()
		
		if(!_.isArray(data))
			dataArray=[data]
		
		if(globalServiceP){
			globalServiceUid=_.get( _.find(this.allServices, o=>o.name==globalServiceP||o.uid==globalServiceP), 'uid')
		}
		
		/**
		 * remodelling of data: we need the data grouped per service
		 */
		_.forEach(dataArray, dataRow=>{
			let serviceUid=globalServiceUid
			if(dataRow.service)
				serviceUid=_.get( _.find(this.allServices, o=>o.name==dataRow.service||o.uid==dataRow.service ), 'uid')
			
			if(!serviceUid) {
				debug(`no dot4 service found for ${globalServiceP}, ${dataRow.service}. Skipping it for now.`)
				return
			}
			
			let targetUploadObject=standardKpis
			, kpi=dataRow.kpi||globalKpi
			;
			if(_.some(this.allKpis, oneOfAllKpi=>oneOfAllKpi.name==kpi && !oneOfAllKpi.isSystem)){
				targetUploadObject=customKpis
			}
			
			let timestamp=moment(dataRow.date).format()
			, kpiValues=_.find(targetUploadObject, {timestamp} )
			;
			
			// debug(`search in targetUploadObject[${serviceUid}] for obj with timestamp ${timestamp}`)
			if(!kpiValues){
				kpiValues={ timestamp }
				targetUploadObject.push(kpiValues)
				kpiValues.uid = serviceUid
			}
			kpiValues[kpi]=dataRow.value
		})
		
		/** upload action */
		let collectedPromises=[]
		if(customKpis.length){
			// debug(JSON.stringify(customKpis))
			collectedPromises.push(this.request({ 
					method: 'post',
					httpsAgent: this.httpsAgent,
					baseURL: this.baseURL,
					url: '/api/service/customkpi-collection',
					headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
					data: { 
						kpis: customKpis
					}
				})
			)
		}
		if(standardKpis.length){
			// debug(JSON.stringify(standardKpis))
			collectedPromises.push(this.request({ 
					method: 'post',
					httpsAgent: this.httpsAgent,
					baseURL: this.baseURL,
					url: '/api/service/kpi-collection',
					headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
					data: { 
						payload: standardKpis
					}
				})
			)
		}
		if(!collectedPromises.length)
			return "nothing to upload"
			
		return _.flatten(await Promise.all(collectedPromises))
	}
}
