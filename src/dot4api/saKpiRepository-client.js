'use strict';

process.env.DEBUG="dot4-client" //####### OUT!!!!!!!!!!!

const _ = require('lodash')
, axios = require('axios')
, https = require('https')
, moment= require("moment")
, promiseLimit = require('p-limit')
;

const debug = require('../lib/debug');

module.exports = class SaKpiRepositoryClient {
	constructor(config) {
		this.baseURL=config.url
		this.apiKey=config.apiKey
		this.httpsAgent = new https.Agent({  
			rejectUnauthorized: false
		})
		this.promiseLimitCollect = promiseLimit(1)
	}
	
	/**
	 * login to Dot4 Kpi Repository. 
	 */
	async login() {
		debug(`login to url: ${this.baseURL+'/api/token'}`)
		let kpiRepLogin=await axios({ 
		  httpsAgent: this.httpsAgent,
		  method: 'post',
		  baseURL: this.baseURL,
		  url: '/api/token',
		  rejectUnauthorized: false,
		  data: 
		   { apiKey:this.apiKey }
		})
		this.kpiRepToken=_.get(kpiRepLogin,"data.data.access_token")
		debug(`kpiRepToken: ${this.kpiRepToken}`)
	}
	
	async getAllServices(){
		/**
		 * load Service IDs from Dot4 Kpi Repository
		 */
		debug("get Dot4 service IDs from dot4SaKpiRepository")
		const allServicesResp=await axios({ 
		  method: 'get',
		  httpsAgent: this.httpsAgent,
		  baseURL: this.baseURL,
		  url: '/api/service',
		  headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
		})
		this.allServices=_.get(allServicesResp, "data.data")
		debug(`allServices: ${JSON.stringify(this.allServices)}`)
	}
	
	/**
	 *
	 * data=[
	 *   { service: "uid|name", date: "2019-04-15", value: 4, kpi: "volumeTotal" }
	 * ]
	 *
	 */
	async uploadKpis(data){
		
		let dataArray=data
		, customKpisPerService={}
		, standardKpis={}
		;
		
		if(!_.isArray(data))
			dataArray=[data]
		
		/**
		 * remodelling of data: we need the data grouped per service
		 */
		_.forEach(dataArray, dataRow=>{
			let serviceUid=_.get( _.find(this.allServices, o=>o.name==dataRow.service||o.uid==dataRow.service ), 'uid')
			
			if(!serviceUid) {
				debug("no dot4 service found for "+dataRow.service+". Skipping it for now.")
				return
			}
			
			let targetUploadObject=standardKpis
			if( _.find(this.allServices,s=>_.isArray(s.kpiDefinitions)&&s.kpiDefinitions.indexOf(dataRow.kpi)>=0) )
				targetUploadObject=customKpisPerService
			
			if(!targetUploadObject[serviceUid])
				targetUploadObject[serviceUid]=[]
			
			let timestamp=moment(dataRow.date).format()
			, customKpiValues=_.find(targetUploadObject[serviceUid], {timestamp} )
			, newEntry
			;
			
			if(!customKpiValues){
				customKpiValues={ timestamp }
				newEntry=true
			}
			customKpiValues[dataRow.kpi]=dataRow.value
			if(newEntry)
				targetUploadObject[serviceUid].push(customKpiValues)
		})
		
		/** upload action */
		let collectedPromises=[]
		_.forEach(customKpisPerService, (kpis, serviceUid)=>{
			collectedPromises.push(promiseLimitCollect(()=>axios({ 
						method: 'post',
						httpsAgent: this.httpsAgent,
						baseURL: this.baseURL,
						url: '/api/service/customkpi-collection',
						headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
						body: { 
							serviceUid,
							kpis
						}
					})
				)
			)
		})
		_.forEach(standardKpis, kpi=>{
			collectedPromises.push(promiseLimitCollect(()=>axios({ 
						method: 'post',
						httpsAgent: this.httpsAgent,
						baseURL: this.baseURL,
						url: '/api/service/kpi-collection',
						headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
						body: { 
							payload: kpi
						}
					})
				)
			)
		})
		await Promise.all(collectedPromises)
	}
}
