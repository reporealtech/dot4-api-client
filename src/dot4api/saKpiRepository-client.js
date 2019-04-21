'use strict';

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
	
	async request(options){
		debug(`request to url: ${options.url}`)
		try {
			return _.get(await axios(options),"data.data")
		} catch(e) {
			let errMsg=_.get(e,"response.data.error")
			if(errMsg){
				debug(errMsg)
				throw new Error(errMsg)
			}
			throw e
		}
	}
	
	/**
	 * login to Dot4 Kpi Repository. 
	 */
	async login() {
		debug(`login to url: ${this.baseURL+'/api/token'} with apiKey: ${this.apiKey.substring(0,10)}...`)
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
		debug(`kpiRepToken: ${this.kpiRepToken.substring(0,10)}...`)
		
	}
	
	async getAllServices(){
		/**
		 * load Service IDs from Dot4 Kpi Repository
		 */
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
	
	/**
	 *
	 * data=[
	 *   { service: "uid|name", date: "2019-04-15", value: 4, kpi: "volumeTotal" }
	 * ]
	 *
	 */
	async uploadKpis(data){
		if(!this.allServices)
			await this.getAllServices()
		
		let dataArray=data
		, customKpis=[]
		, standardKpis=[]
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
			if( _.find(this.allServices,s=>_.isArray(s.kpiDefinitions)&&s.kpiDefinitions.indexOf(dataRow.kpi)>=0) ){
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
			kpiValues[dataRow.kpi]=dataRow.value
		})
		
		/** upload action */
		let collectedPromises=[]
		collectedPromises.push(this.promiseLimitCollect(async ()=>{
					debug(`pushing customkpi-collection. kpis: ${JSON.stringify(customKpis)}`)
					let respData=await this.request({ 
						method: 'post',
						httpsAgent: this.httpsAgent,
						baseURL: this.baseURL,
						url: '/api/service/customkpi-collection',
						headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
						data: { 
							kpis: customKpis
						}
					})
					debug(respData)
					return respData
				}
			)
		)
		
		collectedPromises.push(this.promiseLimitCollect(async()=>{
					debug(`pushing kpi-collection: ${JSON.stringify(standardKpis)}`)
					let respData=await this.request({ 
						method: 'post',
						httpsAgent: this.httpsAgent,
						baseURL: this.baseURL,
						url: '/api/service/kpi-collection',
						headers: { 'Authorization': 'Bearer '+this.kpiRepToken },
						data: { 
							payload: standardKpis
						}
					})
					debug(respData)
					return respData
				}
			)
		)
		return await Promise.all(collectedPromises)
	}
}
