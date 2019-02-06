'use strict';

const _ = require('lodash');

const debug = require('../lib/debug');
const BaseApi = require('./base-api');

function _flattenCiTypeTree(data, citypes) {
  if (_.isUndefined(citypes)) {
    citypes = {};
  }

  data.forEach(e => {
    //    if (!e.isCategory) {
    citypes[_.toLower(e.uuid)] = {
      id: e.id,
      alias: e.alias,
      name: e.name,
      path: e.path,
      isCategory: e.isCategory,
      parentIds: e.parentIds
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
      let url = `api/CIs?$filter=${query}`;

      return await this.dot4Client.getRequest(url);
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

      const relationType = _.find(ciRelationTypes, { uuid });
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

      const indexLifecycle = _.findIndex(lifecyles, { uuid: lifecycleUuid });
      if (indexLifecycle === -1) {
        throw new Error(`Lifecycle not found with uuid='${lifecycleUuid}'`);
      }
      const lifecycle = lifecyles[indexLifecycle];

      const indexPhase = _.findIndex(lifecycle.lifecyclePhases, {
        uuid: phaseUuid
      });
      if (indexPhase === -1) {
        throw new Error(`Lifecycle Phase not found with uuid='${phaseUuid}'`);
      }
      const phase = lifecycle.lifecyclePhases[indexPhase];

      const indexStatus = _.findIndex(phase.lifecycleStatus, {
        uuid: statusUuid
      });
      if (indexStatus === -1) {
        throw new Error(`Lifecycle Status not found with uuid='${statusUuid}'`);
      }

      const status = phase.lifecycleStatus[indexStatus];

      return {
        lifecycleId: lifecycle.id,
        lifecyclePhaseId: phase.id,
        lifecycleStatusId: status.id
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
        ciQuery = `(ciTypeId eq ${ciTypeId})`;
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

    if (_.isNaN(id)) {
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

  async createCi(ci, ciTypeUuid) {
    try {
      debug(`${this.name}.createCi('${JSON.stringify(ci)}', '${ciTypeUuid}') ...`);
      const url = `api/cis`;

      if (_.isNil(ci)) {
        throw new Error('ci object not set');
      }

      if (!_.isUndefined(ciTypeUuid)) {
        ci.ciTypeId = this.getCiTypeId(ciTypeUuid);
      }

      if (isNaN(ci.ciTypeId) || ci.ciTypeId < 0) {
        throw new Error(`ciTypeId of ci is not a valid number [${ci.ciTypeId}]`);
      }

      if (!ci.name) {
        throw new Error(`name of ci is not set [${ci.name}]`);
      }

      ci.$type = 'Common.DomainModels.ConfigurationMgmt.CI, Realtech.Common.DomainModels';

      const createdCi = await this.dot4Client.postRequest(url, ci);

      return createdCi;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createCi(...) finished.`);
    }
  }

  async updateCi(ci) {
    try {
      debug(`${this.name}.createCi(${JSON.stringify}) ...`);

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

      const updatedCi = await this.dot4Client.putRequest(url, ci);

      return updatedCi;
    } catch (error) {
      return error;
    } finally {
      debug(`${this.name}.updateCi(...) finished.`);
    }
  }

  async createRelation(sourceCIId, destinationCIIds, relationTypeUuid) {
    try {
      debug(`${this.name}.createRelation('${sourceCIId}, ${destinationCIIds}, ${relationTypeUuid}') ...`);

      let relationTypeId = 0;

      if (isNaN(sourceCIId) || sourceCIId < 0) {
        throw new Error(`sourceCIId is not a valid number ${sourceCIId}`);
      }

      const url = `api/CIRelations/forCI/create/${sourceCIId}`;

      if (!_.isArray(destinationCIIds)) {
        throw new Error(`destinationCIIds is not aan array ${destinationCIIds}`);
      }

      if (_.isUndefined(relationTypeUuid)) {
        throw new Error(`relationTypeUuid not set '${relationTypeUuid}'`);
      }

      relationTypeId = await this.getRelationTypeId(relationTypeUuid);

      if (isNaN(relationTypeId) || relationTypeId < 0) {
        throw new Error(`relationTypeId is not a valid number [${relationTypeId}]`);
      }

      const ciRelations = [];
      _.forEach(destinationCIIds, destinationCIId => {
        const ciRelation = {
          $type: 'Common.DomainModels.ConfigurationMgmt.CIRelation, Realtech.Common.DomainModels',
          id: 0,
          relationTypeId,
          sourceCIId,
          destinationCIId
        };

        ciRelations.push(ciRelation);
      });

      const createdCiRelation = await this.dot4Client.postRequest(url, ciRelations);

      return createdCiRelation;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createRelation(...) finished.`);
    }
  }
}

module.exports = ConfigurationManagementApi;
