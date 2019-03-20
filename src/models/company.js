'use strict';

const CI = require("./ci")
;

class Company extends CI {
	
	static getCiTypeAlias() { return 'COMP' }
	
}

module.exports = Company;
