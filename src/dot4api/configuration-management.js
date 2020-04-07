/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

const _ = require('lodash')
, querystring = require("querystring")
;
const _ = require('lodash'),
  querystring = require('querystring');

const debug = require('../lib/debug');
const BaseApi = require('./base-api');

function _flattenCiTypeTree(data, citypes) {
  if (_.isUndefined(citypes)) {
    citypes = {};
  }

  data.forEach((e) => {
    //    if (!e.isCategory) {
    citypes[_.toLower(e.uuid)] = {
      id: e.id,
      alias: e.alias,
      name: e.name,
      path: e.path,
      isCategory: e.isCategory,
      parentIds: e.parentIds,
    };
    //    }

    _flattenCiTypeTree(e.items, citypes);
  });

  return citypes;
}

class ConfigurationManagementApi extends BaseApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'ConfigurationManagementApi';
    this.ciTypes = undefined;
    this.ciTypesTree = undefined;
    this.ciRelationTypes = undefined;
    this.ciLifeCycles = undefined;
  }

  async getCiTypeTree(reload) {
    try {
      debug(`${this.name}.getCiTypeTree() ...`);

      if (reload || _.isUndefined(this.ciTypesTree)) {
        let url = `api/CITypeTree`;
        this.ciTypesTree = await this.dot4Client.getRequest(url);
      }

      return this.ciTypesTree;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getCiTypeTree() finished`);
    }
  }

  async getCiTypeList(reload = false) {
    try {
      debug(`${this.name}.getCitypeList() ...`);
      if (reload || _.isUndefined(this.ciTypes)) {
        const ciTypesTree = await this.getCiTypeTree(reload);

        this.ciTypes = _flattenCiTypeTree(ciTypesTree);
      }

      return this.ciTypes;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getCitypeList() finished.`);
    }
  }

  async getCis(query) {
    try {
      debug(`${this.name}.getCis(${query}) ...`);
      // let url = `api/CIs?$filter=${query}`;
      // return await this.dot4Client.getRequest(url);
      let cis = await this.loadAllCisForFilter(query);
      return {
        items: cis,
        count: _.get(cis, 'length') || 0,
      };
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getCis query=[${query}]  finished.`);
    }
  }

  getCiType(uuid) {
    try {
      debug(`${this.name}.getCiType() ...`);

      if (!uuid) {
        throw new Error('ciTypeUuid is not set');
      }

      const ciType = this.ciTypes[_.toLower(uuid)];
      if (!ciType) {
        throw new Error(`ciType not found with uuid='${uuid}'`);
      }

      return ciType;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getCiType() finished.`);
    }
  }

  getCiTypeId(uuid) {
    try {
      debug(`${this.name}.getCiTypeId(${uuid}) ...`);

      if (!uuid) {
        throw new Error('ciTypeUuid is not set');
      }

      const ciType = this.getCiType(uuid);

      return ciType.id;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getCiTypeId() finished.`);
    }
  }

  async getRelationTypes(reload = false) {
    try {
      debug(`${this.name}.getRelationTypes() ...`);

      if (reload || _.isUndefined(this.ciRelationTypes)) {
        let url = `api/CIRelationTypes`;

        const result = await this.dot4Client.getRequest(url);
        this.ciRelationTypes = result;
      }

      return this.ciRelationTypes;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getRelationTypes() finished`);
    }
  }

  async getRelationTypeId(uuid) {
    try {
      debug(`${this.name}.getRelationTypeId() ...`);

      const ciRelationTypes = await this.getRelationTypes();

      const relationType = _.find(ciRelationTypes, {
        uuid,
      });
      if (_.isUndefined(relationType)) {
        throw new Error(`CI Relation Type with uuid='${uuid}' not found!`);
      }

      return relationType.id;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getRelationTypeId() finished`);
    }
  }

  async getLifeCycles(reload) {
    try {
      debug(`${this.name}.getLifeCycles() ...`);

      if (reload || _.isUndefined(this.ciLifeCycles)) {
        let url = `api/LifecycleModels`;

        this.ciLifeCycles = await this.dot4Client.getRequest(url);
      }

      return this.ciLifeCycles;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getLifeCycles() finished`);
    }
  }

  async getLifecycleId(lifecycleUuid, phaseUuid, statusUuid) {
    try {
      debug(`${this.name}.getLifecycleId() ...`);

      const lifecyles = await this.getLifeCycles();

      const indexLifecycle = _.findIndex(lifecyles, {
        uuid: lifecycleUuid,
      });
      if (indexLifecycle === -1) {
        throw new Error(`Lifecycle not found with uuid='${lifecycleUuid}'`);
      }
      const lifecycle = lifecyles[indexLifecycle];

      const indexPhase = _.findIndex(lifecycle.lifecyclePhases, {
        uuid: phaseUuid,
      });
      if (indexPhase === -1) {
        throw new Error(`Lifecycle Phase not found with uuid='${phaseUuid}'`);
      }
      const phase = lifecycle.lifecyclePhases[indexPhase];

      const indexStatus = _.findIndex(phase.lifecycleStatus, {
        uuid: statusUuid,
      });
      if (indexStatus === -1) {
        throw new Error(`Lifecycle Status not found with uuid='${statusUuid}'`);
      }

      const status = phase.lifecycleStatus[indexStatus];

      return {
        lifecycleId: lifecycle.id,
        lifecyclePhaseId: phase.id,
        lifecycleStatusId: status.id,
      };
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getLifecycleId() finished`);
    }
  }

  async getCisByCiTypeUuidDropdown(ciTypeUuid) {
    try {
      debug(`${this.name}.getCisByCiTypeUuidDropdown('${ciTypeUuid}') ...`);

      const ciTypeId = this.getCiTypeId(ciTypeUuid);
      const url = `api/CIs/dropdown/byCiType/${ciTypeId}`;

      return await this.dot4Client.getRequest(url);
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getCisByType(...) finished.`);
    }
  }

  async getCisByCiTypeUuid(ciTypeUuid, query) {
    try {
      debug(`${this.name}.getCisByType('${ciTypeUuid}', '${query}') ...`);

      const ciTypeId = this.getCiTypeId(ciTypeUuid);

      let ciQuery;
      if (query && query.length > 0) {
        ciQuery = `(ciTypeId eq ${ciTypeId} and (${query}))`;
      } else {
        ciQuery = `ciTypeId eq ${ciTypeId}`;
      }

      return await this.getCis(ciQuery);
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getCisByType('${ciTypeUuid}', '${query}') finished.`);
    }
  }

  async getCi(id) {
    debug(`${this.name}.getCi(${id}) ...`);

    if (typeof id === 'string' && !/^\d+$/.test(id)) {
      throw new Error(`id of getCi is not a number [${id}]`);
    }

    const url = `api/cis?id=${id}`;

    try {
      return await this.dot4Client.getRequest(url);
    } catch (error) {
      return error;
    } finally {
      debug(`${this.name}.getCi(${id}) finished.`);
    }
  }
  
  async searchCis(searchterm, fuzziness=-1, ciTypeIds=[], skip=0, top=50){
	//https://vnext-api.realtech.com/api/CISearch/SearchCIs?$top=50&$skip=0&$filter=name%20eq%20%27Bernd%20Ludwig%27
	debug(`${this.name}.searchCis("${searchterm}") ...`);

    const url = `api/CISearch/SearchCIs/${fuzziness}?$top=${top}&$skip=${skip}&$filter=`+querystring.escape(`name eq '${searchterm}'`);

    const url =
      'api/CISearch/SearchCIs?$filter=' +
      querystring.escape(`name eq '${searchterm}'`);

    try {
      return await this.dot4Client.putRequest(url);
    } catch (error) {
      return error;
    } finally {
      debug(`${this.name}.searchCis("${searchterm}") finished.`);
    }
  }

  /**
   * @param ci
   * @param ciTypeUuid: not needed if ci.ciTypeId is set
   */
  async createCi(ci, ciTypeUuid) {
    try {
      const url = `api/cis`;

      if (_.isNil(ci)) {
        throw new Error('ci object not set');
      }

      if (!_.isUndefined(ciTypeUuid)) {
        ci.ciTypeId = this.getCiTypeId(ciTypeUuid);
      }

      if (isNaN(ci.ciTypeId) || ci.ciTypeId < 0) {
        throw new Error(
          `ciTypeId of ci is not a valid number [${ci.ciTypeId}]`,
        );
      }

      if (!ci.name) {
        throw new Error(`name of ci is not set [${ci.name}]`);
      }

      if (!ci.$type)
        ci.$type =
          'Common.DomainModels.ConfigurationMgmt.CI, Realtech.Common.DomainModels';

      const createdCi = await this.dot4Client.postRequest(url, ci);

      return createdCi;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createCi(...) finished.`);
    }
  }

  async updateCi(ci) {
    debug(`${this.name}.updateCi({name: ${ci.name}, id: ${ci.id}) ...`);

    if (_.isNil(ci)) {
      throw new Error('ci object not set');
    }

    let id = ci.id;
    if (_.isNaN(id) || id < 0) {
      throw new Error(`id of ci is not a valid number [${id}]`);
    }
    const url = `api/cis?id=${id}`;

    if (_.isNaN(ci.ciTypeId) || ci.ciTypeId < 0) {
      throw new Error(`ciTypeId of ci is not a valid number [${ci.ciTypeId}]`);
    }

    if (_.isEmpty(ci.name)) {
      throw new Error(`name of ci is not set [${ci.name}]`);
    }

    // debug("make putRequest");
    return await this.dot4Client.putRequest(url, ci);
  }

  async deleteCi(ci) {
    try {
      debug(`${this.name}.deleteCi(${JSON.stringify(ci)}) ...`);

      if (_.isNil(ci)) {
        throw new Error('ci object not set');
      }

      let id = ci.id;
      if (_.isNaN(id) || id < 0) {
        throw new Error(`id of ci is not a valid number [${id}]`);
      }
      // const url = "api/cis" //`api/cis?id=${id}`;
      const url = `api/cis?ids=[${id}]`;

      // await this.dot4Client.deleteRequest(url, {ids: [id]} ); //, ci
      await this.dot4Client.deleteRequest(url); //, ci
    } catch (error) {
      return error;
    } finally {
      debug(`${this.name}.deleteCi(...) finished.`);
    }
  }

  async getRelationsForCI(ci_id, filter) {
    debug(`${this.name}.getRelation(${filter}) ...`);

    let url = `api/CIRelations/forCI/${ci_id}`;
    if (filter) url += `?$filter=${filter}`;

    try {
      return await this.dot4Client.getRequest(url);
    } catch (error) {
      return error;
    } finally {
      debug(`${this.name}.getRelation(${filter}) finished.`);
    }
  }

  async createRelation(sourceCIId, destinationCIIds, relationTypeUuid) {
    try {
      debug(
        `${this.name}.createRelation('${sourceCIId}, ${destinationCIIds}, ${relationTypeUuid}') ...`,
      );

      let relationTypeId = 0;

      if (isNaN(sourceCIId) || sourceCIId < 0) {
        throw new Error(`sourceCIId is not a valid number ${sourceCIId}`);
      }

      const url = `api/CIRelations/forCI/create/${sourceCIId}`;

      if (!_.isArray(destinationCIIds)) {
        throw new Error(
          `destinationCIIds is not aan array ${destinationCIIds}`,
        );
      }

      if (_.isUndefined(relationTypeUuid)) {
        throw new Error(`relationTypeUuid not set '${relationTypeUuid}'`);
      }

      relationTypeId = await this.getRelationTypeId(relationTypeUuid);

      if (isNaN(relationTypeId) || relationTypeId < 0) {
        throw new Error(
          `relationTypeId is not a valid number [${relationTypeId}]`,
        );
      }

      const ciRelations = [];
      _.forEach(destinationCIIds, (destinationCIId) => {
        const ciRelation = {
          $type:
            'Common.DomainModels.ConfigurationMgmt.CIRelation, Realtech.Common.DomainModels',
          id: 0,
          relationTypeId,
          sourceCIId,
          destinationCIId,
        };

        ciRelations.push(ciRelation);
      });

      const createdCiRelation = await this.dot4Client.postRequest(
        url,
        ciRelations,
      );

      return createdCiRelation;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createRelation(...) finished.`);
    }
  }

  async loadAllCisForFilter(serverFilter, clientFilter) {
    debug(`loadAllCisForFilter()`);
    let cis = [],
      numToLoadPerReq = 200,
      pCount = 1,
      skip = 0;

    for (let cnt of [...Array(10).keys()]) {
      if (cis.length >= pCount) {
        break;
      }

      let url = '/api/cis';

      if (serverFilter) {
        /* if(serverFilter.match(/^ciTypeId eq (\d+)/))
				  url+="/byCiType/"+RegExp.$1+"?"; //TODO: $top und $skip funktionieren nicht und beschraenkt
			  else
				  url+='?$filter='+querystring.escape(serverFilter);
			  url+='&'*/

        url += '?$filter=' + querystring.escape(serverFilter) + '&';
      } else url += '?';

      url += `$top=${numToLoadPerReq}&$skip=${numToLoadPerReq * skip}`; //TODO: all Attrs needed!

      const newP = await this.safeDot4ClientRequest('get', url);
      cis.push(...newP.items);
      pCount = newP.count;
      debug(
        `loadAllCisForFilter(): must load ${pCount} CIs with serverFilter ${JSON.stringify(
          serverFilter,
        )}, clientFilter ${JSON.stringify(clientFilter)}. `,
      );
      // debug(`first item: ${JSON.stringify(_.first(newP.items))}`)
      skip++;
    }
    if (clientFilter) cis = _.filter(cis, clientFilter);

    return cis;
  }

  async createOrActivateCiAttributeTypeIfNeeded(ciTypeAlias, newTypeName) {
    const ciTypeList = await this.getCiTypeList(),
      ciType_PERS_id = _.get(
        _.find(ciTypeList, {
          alias: ciTypeAlias,
        }),
        'id',
      ),
      existingCiAttributeTypesForPersons = await this.getCiAttributeTypes(
        ciType_PERS_id,
      );
    let ciType_externalUserID = _.find(existingCiAttributeTypesForPersons, {
      name: newTypeName,
    });

    if (!ciType_externalUserID) {
      debug('#creating attribute ' + newTypeName);
      ciType_externalUserID = await this.createCiAttributeType({
        ciTypeId: ciType_PERS_id,
        name: newTypeName,
        isUnique: true,
      });
      // ciType_externalUserID.justCreated=true
    } else if (!ciType_externalUserID.isActive) {
      debug('#updating attribute ' + newTypeName);
      ciType_externalUserID.isActive = true;
      ciType_externalUserID = await this.updateCiAttributeType(
        ciType_externalUserID,
      );
    } else {
      // debug('#'+JSON.stringify(ciType_externalUserID))
    }
    // debug(JSON.stringify(ciType_externalUserID))
    return ciType_externalUserID;
  }

  async getCiAttributeTypes(ciId) {
    return await this.safeDot4ClientRequest(
      'get',
      `api/CIAttributeTypes?ciTypeId=${ciId}&slim=false&onlyActive=false`,
    );
  }

  setAttrIfNotSet(props, name, val) {
    if (!props[name]) props[name] = val;
  }

  async createCiAttributeType(attrs) {
    if (!_.has(attrs, 'ciTypeId') || !_.has(attrs, 'name')) {
      debug('createCiAttributeType: missing params');
    }

    attrs.id = 0;

    this.setAttrIfNotSet(attrs, 'accessMode', 1);
    this.setAttrIfNotSet(attrs, 'allowMultiple', false);
    this.setAttrIfNotSet(attrs, 'description', attrs.name);
    this.setAttrIfNotSet(attrs, 'groupId', 1);
    this.setAttrIfNotSet(attrs, 'inInfoDialog', false);
    this.setAttrIfNotSet(attrs, 'isActive', true);
    this.setAttrIfNotSet(attrs, 'isMandatory', false);
    this.setAttrIfNotSet(attrs, 'isUnique', false);
    this.setAttrIfNotSet(attrs, 'parentId', null);
    this.setAttrIfNotSet(attrs, 'showInList', true);
    this.setAttrIfNotSet(attrs, 'versionControlMode', 0);
    this.setAttrIfNotSet(attrs, 'dataType', {
      backgroundColor: '#FFFFFF',
      category: 1,
      dataTypeLength: 100,
      foregroundColor: '#000000',
      formFieldType: 1,
      maxCount: 0,
      maxSize: 0,
      objectType: 1,
      referencedCIAttributeTypes: [],
      typeName: 'CIAttributeDataType',
      unitCategoryId: 1,
      unitId: 1,
    });

    debug(`createCiAttributeType(${JSON.stringify(attrs)})`);
    return await this.safeDot4ClientRequest(
      'post',
      `api/CIAttributeTypes`,
      attrs,
    );
  }

  async updateCiAttributeType(attrs) {
    if (
      !_.has(attrs, 'id') ||
      !_.has(attrs, 'ciTypeId') ||
      !_.has(attrs, 'name')
    ) {
      debug('updateCiAttributeType: missing params');
    }

    const id = attrs.id;
    delete attrs.id;

    return await this.safeDot4ClientRequest(
      'put',
      `api/CIAttributeTypes/${id}`,
      attrs,
    );
  }
}

module.exports = ConfigurationManagementApi;
