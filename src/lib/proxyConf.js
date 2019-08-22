'use strict';

const _ = require('lodash')

module.exports = {
	axios: (config)=>{
		const proxyParams=_.get(config,'proxy.url')
		if(proxyParams){
			const pHostAndPort=proxyParams.replace(/https?:\/\//,"")
			, splHostAndPort=pHostAndPort.split(':')
			, proxy={
				host: splHostAndPort[0]
			}
			if(splHostAndPort.length>1)
				proxy.port=splHostAndPort[1]
			if(_.get(config,'proxy.proxyusername')){
				proxy.auth={
					username: config.proxy.proxyusername
				}
				if(_.get(config,'proxy.password'))
					proxy.auth.password=config.proxy.password
			}
			return proxy	
		}
	}
}