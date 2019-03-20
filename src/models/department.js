'use strict';

const CI = require("./ci")
;

class Department extends CI {
	
	static getCiTypeAlias() { return 'DEPA' }
}

module.exports = Department;
