'use strict';
const _ = require('lodash');

const debug = require('../lib/debug');
const ConfigurationManagementApi = require('./configuration-management');

const UUID_CI_CATEGORY_INCIDENTS = '688da5aa-8357-4f84-a873-26a3a1646777';
const UUID_CI_TYPE_INCIDENT = '84d48ab8-a0ca-4b2b-9c89-9d5a23e15c3f';

const COMMENT_TYPES = ['private', 'public', 'portal'];

class IncidentManagementApi extends ConfigurationManagementApi {
  constructor(dot4Client) {
    super(dot4Client);
    this.name = 'IncidentManagementApi';
  }
  
  getUuidCiTypeIncident(){
	  return UUID_CI_TYPE_INCIDENT
  }

  async getIncidents(query) {
    try {
      // debug(`${this.name}.getIncidents("${JSON.stringify(query)}") ...`);
      debug(`${this.name}.getIncidents() ...`);

      const response = await this.getCisByCiTypeUuid(UUID_CI_CATEGORY_INCIDENTS);

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

      const ciTypeIdIncidents = await this.getCiTypeId(UUID_CI_CATEGORY_INCIDENTS);

      const incident = await this.dot4Client.getRequest(`/api/tickets/${id}`);
      if (!incident) {
        throw new Error(`${this.name}.getIncident("${id}"): Incident not found`);
      }

      const ciType = await this.getCiType(incident.ciTypeUUID);
      const isCiTypeIncidens = _.includes(ciType.parentIds, ciTypeIdIncidents);
      if (!isCiTypeIncidens) {
        throw new Error(`${this.name}.getIncident("${id}"): Incident not found. Ci is not of Type Incidents`);
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

      const ciTypeIdIncident = await this.getCiTypeId(UUID_CI_TYPE_INCIDENT);

      const newIncident = _.clone(incident);
      _.set(newIncident, '$type', 'Common.DomainModels.ServiceOperation.Ticket, Realtech.Esm.Common.DomainModels');
      _.set(newIncident, 'ciTypeId', ciTypeIdIncident);

      const createdIncident = await this.dot4Client.postRequest('/api/tickets', newIncident);

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
        throw new Error(`${this.name}.updateIncident(...): Incident id is missing.`);
      }

      const originalIncident = await this.getIncident(incident.id, incident);

      const incidentForUpdate = _.merge(originalIncident, incident);

      const updatedIncident = await this.dot4Client.putRequest(
        `/api/tickets/${incidentForUpdate.id}`,
        incidentForUpdate
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
        throw new Error(`${this.name}.getTicketComments("${ticketId}"): Incident id is missing.`);
      }

      const comments = await this.dot4Client.getRequest(`/api/tickets/${ticketId}/Comments`);

      return comments;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.getTicketComments("${ticketId}")`);
    }
  }

  async addPrivateTicketComment(ticketId, comment) {
    try {
      debug(`${this.name}.addPrivateTicketComment(${ticketId}, ${comment}) ...`);

      const createdComment = this.addTicketComment(ticketId, comment, 'private');

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
      debug(`${this.name}.addPublicTicketComment(${ticketId}, "${commentType}", "${commentType}") ...`);

      if (!_.isInteger(ticketId)) {
        throw new Error(`${this.name}.addPublicTicketComment("${ticketId}"): Incident id is missing.`);
      }

      if (!_.isString(comment)) {
        throw new Error(`${this.name}.addPublicTicketComment("${comment}"): comment is not a string.`);
      }

      if (!_.includes(COMMENT_TYPES, commentType)) {
        throw new Error(
          `${
            this.name
          }.addPublicTicketComment("${comment}"): commentType is not valid. Valid Values are ${COMMENT_TYPES}`
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
      const createdComment = await this.dot4Client.postRequest(url, cleanComment);

      return createdComment;
    } catch (error) {
      throw error;
    } finally {
      debug(`${this.name}.addPublicTicketComment(...)`);
    }
  }
}

module.exports = IncidentManagementApi;
