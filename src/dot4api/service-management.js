/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';

const debug = require('../lib/debug');
const ConfigurationManagementApi = require('./configuration-management');

const UUID_CITYPE_SERVICE = 'DD78037A-CD6A-4D6E-A0CA-AA987B0D98B9';
const UUID_CITYPE_TECHNICAL_SERVICE = '21B91151-DCBD-4FCE-A382-3E44589F6101';
const UUID_LIFECYCLE_SERVICE = '937542f0-3d54-4965-bbd0-1ec137d364f4';
const UUID_LIFECYCLE_PHASE_CATLOG = '04f598ea-c1d8-4f9d-a1de-12094d3a1e48';
const UUID_LIFECYCLE_STATUS_OPERATIONAL = '9eeb3f18-1b55-4f8f-a63a-262a41325e20';

const UUID_RELATIONTYPE_SERVICE_TO_SERVICE = 'cfd33042-c1ae-4e7b-b654-7deaa622fc2e';
const UUID_RELATIONTYPE_SERVICE_TO_TECHNICAL_SERVICE = '9274c1e8-b599-4f9a-ab37-55d32fb8596f';

class ServiceManagementApi extends ConfigurationManagementApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'ServiceManagementApi';
  }

  async getServices(query) {
    try {
      debug(`${this.name}.getServices("${JSON.stringify(query)}") ...`);

      const response = await this.getCisByCiTypeUuid(UUID_CITYPE_SERVICE);

      return response.items;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getServices("${JSON.stringify(query)}")`);
    }
  }

  async getServicesDropdown() {
    try {
      debug(`${this.name}.getServicesDropdown() ...`);

      const response = await this.getCisByCiTypeUuidDropdown(UUID_CITYPE_SERVICE);

      return response;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getServicesDropdown()`);
    }
  }

  async createService(service) {
    try {
      debug(`${this.name}.createService("${JSON.stringify(service)}") ...`);

      const lifecycle = await this.getLifecycleId(
        UUID_LIFECYCLE_SERVICE,
        UUID_LIFECYCLE_PHASE_CATLOG,
        UUID_LIFECYCLE_STATUS_OPERATIONAL
      );
      service.lifecyclePhase = lifecycle.lifecyclePhaseId;
      service.lifecycleStatus = lifecycle.lifecycleStatusId;

      return await this.createCi(service, UUID_CITYPE_SERVICE);
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createService("${JSON.stringify(service)}")`);
    }
  }

  async getTechnicalServices(query) {
    try {
      debug(`${this.name}.getTechnicalService("${JSON.stringify(query)}") ...`);

      const response = await this.getCisByCiTypeUuid(UUID_CITYPE_TECHNICAL_SERVICE);
      return response.items;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getTechnicalService("${JSON.stringify(query)}")`);
    }
  }

  async createTechnicalService(technicalService) {
    try {
      debug(`${this.name}.createTechnicalService("${JSON.stringify(technicalService)}") ...`);

      return await this.createCi(technicalService, UUID_CITYPE_TECHNICAL_SERVICE);
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createTechnicalService("${JSON.stringify(technicalService)}")`);
    }
  }

  async createServiceRelation(sourceId, destinationIds) {
    try {
      debug(`${this.name}.createServiceRelation(${sourceId}, ${destinationIds}) ...`);

      return await this.createRelation(sourceId, destinationIds, UUID_RELATIONTYPE_SERVICE_TO_SERVICE);
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createServiceRelation(...)`);
    }
  }

  async createTechnicalServiceRelation(sourceId, destinationIds) {
    try {
      debug(`${this.name}.createTechnicalServiceRelation(${sourceId}, ${destinationIds}) ...`);

      return await this.createRelation(sourceId, destinationIds, UUID_RELATIONTYPE_SERVICE_TO_TECHNICAL_SERVICE);
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createTechnicalServiceRelation(...)`);
    }
  }
}

module.exports = ServiceManagementApi;
