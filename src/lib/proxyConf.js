'use strict';

const _ = require('lodash')

, splitUp=(config)=>{
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

module.exports = {
	axios: splitUp
	, request: (config)=>{
		const proxyP=splitUp(config);
		let result
		if(proxyP) {
			result='http://';
			if( (_.get(config,'proxy.url')||'').indexOf('https://')!=-1 )
				result='https://';
				
			if(_.get(proxyP,"auth.username")){
				result+=proxyP.auth.username
				if(_.get(proxyP,"auth.password"))
					result+=':'+proxyP.auth.password
				result+='@'
			}
			result+=proxyP.host
			if(proxyP.port)
				result+=':'+proxyP.port
		}
		return result
	}
}