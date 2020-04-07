/**
 * @copyright Copyright (C) REALTECH AG, Germany - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *  Written by Tobias Ceska <tobias.ceska@realtech.com>, December 2019
 */

'use strict';
const _ = require('lodash');

const debug = require('../lib/debug');
const ConfigurationManagementApi = require('./configuration-management');

const SYSTEM_INTERNALS = {
  ciTypeId: {
    standardServiceRequest: 'd0a9cc69-c745-4e52-8971-7bf602d02b5e',
    standardStoerung: '84d48ab8-a0ca-4b2b-9c89-9d5a23e15c3f',
  },
  ciCategory: {
    standardServiceRequest: '31c60a25-caa8-4778-a033-e07c4b8cd3dd',
    standardStoerung: '688da5aa-8357-4f84-a873-26a3a1646777',
  },
  lifecyclePhase: {
    newTicket: '10b14579-7249-441e-a15e-0f5dccf1c9a6',
    closedTicket: '2c61967b-7bee-48bc-a24d-9c334d1aff11',
  },
  lifecycleStatus: {
    newTicket: '909cd549-b80d-4314-943a-b5c5c70c9b02',
    closedTicket: '083109e5-9a84-4c2b-a481-704e1a7b0e8b',
  },
};

const COMMENT_TYPES = ['private', 'public', 'portal'];

class IncidentManagementApi extends ConfigurationManagementApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'IncidentManagementApi';
  }

  getUuidCiTypeIncident() {
    return SYSTEM_INTERNALS.ciTypeId.standardStoerung;
  }

  async getTicketLifecycles() {
    if (!this.ticketLifecycles)
      this.ticketLifecycles = await this.safeDot4ClientRequest(
        'get',
        '/api/tickets/lifecycles',
      );

    return this.ticketLifecycles;
  }

  async getTicketLifecycleOrStatus(uuidOfLifecycleOrStatus) {
    let res = _.get(
      _.find(_.get(await this.getTicketLifecycles(), '[0].lifecyclePhases'), {
        uuid: uuidOfLifecycleOrStatus,
      }),
      'id',
    );
    if (!res) {
      _.forEach(
        _.get(await this.getTicketLifecycles(), '[0].lifecyclePhases'),
        function (lcp) {
          let resP = _.get(
            _.find(_.get(lcp, 'lifecycleStatus'), {
              uuid: uuidOfLifecycleOrStatus,
            }),
            'id',
          );
          if (resP) res = resP;
        },
      );
    }
    return res;
  }

  async getIncidents(query) {
    try {
      // debug(`${this.name}.getIncidents("${JSON.stringify(query)}") ...`);
      debug(`${this.name}.getIncidents() ...`);

      const response = await this.getCisByCiTypeUuid(
        SYSTEM_INTERNALS.ciCategory.standardStoerung,
      );

      //TODO: query als filter implementieren
      return response.items;
    } catch (error) {
      throw error;
    } finally {
      // debug(`${this.name}.getIncidents("${JSON.stringify(query)}")`);
      debug(`${this.name}.getIncidents()`);
    }
  }

  async getIncident(id) {
    try {
      debug(`${this.name}.getIncident("${id}") ...`);

      const ciTypeIdIncidents = await this.getCiTypeId(
        SYSTEM_INTERNALS.ciCategory.standardStoerung,
      );

      const incident = await this.dot4Client.getRequest(`/api/tickets/${id}`);
      if (!incident) {
        throw new Error(
          `${this.name}.getIncident("${id}"): Incident not found`,
        );
      }

      const ciType = await this.getCiType(incident.ciTypeUUID);
      const isCiTypeIncidens = _.includes(ciType.parentIds, ciTypeIdIncidents);
      if (!isCiTypeIncidens) {
        throw new Error(
          `${this.name}.getIncident("${id}"): Incident not found. Ci is not of Type Incidents`,
        );
      }

      return incident;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getIncident("${id}")`);
    }
  }

  async createIncident(incident) {
    try {
      debug(`${this.name}.createIncident(...) ...`);

      const ciTypeIdIncident = await this.getCiTypeId(
        SYSTEM_INTERNALS.ciTypeId.standardStoerung,
      );

      const newIncident = _.clone(incident);
      _.set(
        newIncident,
        '$type',
        'Common.DomainModels.ServiceOperation.Ticket, Realtech.Esm.Common.DomainModels',
      );
      _.set(newIncident, 'ciTypeId', ciTypeIdIncident);

      const createdIncident = await this.dot4Client.postRequest(
        '/api/tickets',
        newIncident,
      );

      return createdIncident;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.createIncident("...")`);
    }
  }

  async updateIncident(incident) {
    try {
      debug(`${this.name}.updateIncident(...) ...`);

      if (!incident && !_.isInteger(incident.id)) {
        throw new Error(
          `${this.name}.updateIncident(...): Incident id is missing.`,
        );
      }

      const originalIncident = await this.getIncident(incident.id, incident);

      if (incident.status) {
        incident.lifecyclePhase = await this.getTicketLifecycleOrStatus(
          SYSTEM_INTERNALS.lifecyclePhase[incident.status + 'Ticket'],
        );
        incident.lifecycleStatus = await this.getTicketLifecycleOrStatus(
          SYSTEM_INTERNALS.lifecycleStatus[incident.status + 'Ticket'],
        );
      }

      const incidentForUpdate = _.merge(originalIncident, incident);

      const updatedIncident = await this.dot4Client.putRequest(
        `/api/tickets/${incidentForUpdate.id}`,
        incidentForUpdate,
      );

      return updatedIncident;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.updateIncident("...")`);
    }
  }

  async getTicketComments(ticketId) {
    try {
      debug(`${this.name}.getTicketComments(...) ...`);

      if (!_.isInteger(ticketId)) {
        throw new Error(
          `${this.name}.getTicketComments("${ticketId}"): Incident id is missing.`,
        );
      }

      const comments = await this.dot4Client.getRequest(
        `/api/tickets/${ticketId}/Comments`,
      );

      return comments;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getTicketComments("${ticketId}")`);
    }
  }

  async addPrivateTicketComment(ticketId, comment) {
    try {
      debug(
        `${this.name}.addPrivateTicketComment(${ticketId}, ${comment}) ...`,
      );

      const createdComment = this.addTicketComment(
        ticketId,
        comment,
        'private',
      );

      return createdComment;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.addPrivateTicketComment("${ticketId}")`);
    }
  }

  async addPublicTicketComment(ticketId, comment) {
    try {
      debug(`${this.name}.addPublicTicketComment(${ticketId}, ${comment}) ...`);

      const createdComment = this.addTicketComment(ticketId, comment, 'public');

      return createdComment;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.addPublicTicketComment("${ticketId}")`);
    }
  }

  async addPublicPortalTicketComment(ticketId, comment) {
    try {
      debug(`${this.name}.addPublicTicketComment(${ticketId}, ${comment}) ...`);

      const createdComment = this.addTicketComment(ticketId, comment, 'portal');

      return createdComment;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.addPublicTicketComment("${ticketId}")`);
    }
  }

  async addTicketComment(ticketId, comment, commentType) {
    try {
      debug(
        `${this.name}.addPublicTicketComment(${ticketId}, "${commentType}", "${commentType}") ...`,
      );

      if (!_.isInteger(ticketId)) {
        throw new Error(
          `${this.name}.addPublicTicketComment("${ticketId}"): Incident id is missing.`,
        );
      }

      if (!_.isString(comment)) {
        throw new Error(
          `${this.name}.addPublicTicketComment("${comment}"): comment is not a string.`,
        );
      }

      if (!_.includes(COMMENT_TYPES, commentType)) {
        throw new Error(
          `${this.name}.addPublicTicketComment("${comment}"): commentType is not valid. Valid Values are ${COMMENT_TYPES}`,
        );
      }

      let url;
      switch (commentType) {
        case 'private':
          url = `/api/tickets/${ticketId}/privateComment`;
          break;
        case 'public':
          url = `/api/tickets/${ticketId}/publicComment`;
          break;
        case 'portal':
          url = `/api/tickets/portal/${ticketId}/publicComment`;
          break;
      }

      let cleanComment = '"' + comment.replace(new RegExp('"'), '\\"') + '"';
      cleanComment = cleanComment.replace(new RegExp('\r?\n', 'g'), '<br>');
      const createdComment = await this.dot4Client.postRequest(
        url,
        cleanComment,
      );

      return createdComment;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.addPublicTicketComment(...)`);
    }
  }
}

module.exports = IncidentManagementApi;
