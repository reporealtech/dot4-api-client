/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

const debug = require('../lib/debug');

class BaseApi {
  constructor(dot4Client) {
    this.dot4Client = dot4Client;
  }
  
    async safeDot4ClientRequest(method, url, reqParams){
	//get calling function name from stack trace
	let e = new Error()
	, frame = e.stack.split("\n")[2]
	, functionName = frame.split(" ")[5];
	
	try {
		
      debug(`${functionName}(...) ...`);

      const res = await this.dot4Client[`${method.toLowerCase()}Request`](url, reqParams);

      return res;
    } catch (error) {
      throw error;
    } finally {
      debug(`${functionName}("...") finished.`);
    }
  }

}

module.exports = BaseApi;
