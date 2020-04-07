/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

const CI = require("./ci");

class Company extends CI {

  static getCiTypeAlias() {
    return 'COMP'
  }

}

module.exports = Company;