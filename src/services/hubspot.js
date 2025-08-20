const axios = require('axios');
const config = require('../config/hubspot');
const logger = require('../utils/logger');

class HubSpotService {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Create a new contact with custom properties
  async createContact(contactData) {
    try {
      logger.info('Creating new contact in HubSpot');
      
      // Build properties object with both standard and custom properties
      const properties = {
        // Standard HubSpot properties
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        hubspot_owner_id: contactData.ownerId,
        
        // Custom candidate properties
        candidate_experience: contactData.candidateExperience,
        candidate_date_of_joining: contactData.candidateDateOfJoining,
        candidate_name: contactData.candidateName,
        candidate_past_company: contactData.candidatePastCompany
      };

      // Remove undefined properties
      Object.keys(properties).forEach(key => {
        if (properties[key] === undefined || properties[key] === null || properties[key] === '') {
          delete properties[key];
        }
      });

      const payload = { properties };
      
      logger.info('Contact payload:', payload);

      const response = await axios.post(
        `${this.baseUrl}${config.endpoints.contacts}`,
        payload,
        { headers: this.headers }
      );

      logger.success('Contact created successfully', {
        contactId: response.data.id,
        properties: response.data.properties
      });

      return {
        success: true,
        contact: response.data,
        contactId: response.data.id
      };

    } catch (error) {
      logger.error('Failed to create contact', error);
      throw {
        success: false,
        error: error.message,
        details: error.response?.data || null
      };
    }
  }

  // Update an existing contact
  async updateContact(contactId, updateData) {
    try {
      logger.info(`Updating contact ${contactId}`);

      // Build properties object for update
      const properties = {};
      
      // Map update data to HubSpot properties
      if (updateData.firstName !== undefined) properties.firstname = updateData.firstName;
      if (updateData.lastName !== undefined) properties.lastname = updateData.lastName;
      if (updateData.email !== undefined) properties.email = updateData.email;
      if (updateData.phone !== undefined) properties.phone = updateData.phone;
      if (updateData.ownerId !== undefined) properties.hubspot_owner_id = updateData.ownerId;
      if (updateData.candidateExperience !== undefined) properties.candidate_experience = updateData.candidateExperience;
      if (updateData.candidateDateOfJoining !== undefined) properties.candidate_date_of_joining = updateData.candidateDateOfJoining;
      if (updateData.candidateName !== undefined) properties.candidate_name = updateData.candidateName;
      if (updateData.candidatePastCompany !== undefined) properties.candidate_past_company = updateData.candidatePastCompany;

      const payload = { properties };
      
      logger.info('Update payload:', payload);

      const response = await axios.patch(
        `${this.baseUrl}${config.endpoints.contacts}/${contactId}`,
        payload,
        { headers: this.headers }
      );

      logger.success('Contact updated successfully', {
        contactId: response.data.id,
        updatedProperties: Object.keys(properties)
      });

      return {
        success: true,
        contact: response.data,
        contactId: response.data.id
      };

    } catch (error) {
      logger.error(`Failed to update contact ${contactId}`, error);
      throw {
        success: false,
        error: error.message,
        details: error.response?.data || null
      };
    }
  }

  // Get contact by ID
  async getContact(contactId, properties = null) {
    try {
      logger.info(`Retrieving contact ${contactId}`);

      let url = `${this.baseUrl}${config.endpoints.contacts}/${contactId}`;
      
      // Add properties parameter if specified
      if (properties) {
        const propsParam = Array.isArray(properties) ? properties.join(',') : properties;
        url += `?properties=${propsParam}`;
      } else {
        // Default properties to retrieve
        const defaultProps = [
          'firstname', 'lastname', 'email', 'phone', 'hubspot_owner_id',
          'candidate_experience', 'candidate_date_of_joining', 
          'candidate_name', 'candidate_past_company'
        ];
        url += `?properties=${defaultProps.join(',')}`;
      }

      const response = await axios.get(url, { headers: this.headers });

      logger.success('Contact retrieved successfully', {
        contactId: response.data.id,
        propertiesCount: Object.keys(response.data.properties || {}).length
      });

      return {
        success: true,
        contact: response.data
      };

    } catch (error) {
      if (error.response?.status === 404) {
        logger.error(`Contact ${contactId} not found`);
        return {
          success: false,
          error: 'Contact not found',
          contactId
        };
      }
      
      logger.error(`Failed to retrieve contact ${contactId}`, error);
      throw {
        success: false,
        error: error.message,
        details: error.response?.data || null
      };
    }
  }

  // Search contacts with filters
  async searchContacts(filters = {}, limit = 10) {
    try {
      logger.info('Searching contacts with filters', filters);

      const searchPayload = {
        filterGroups: [],
        properties: [
          'firstname', 'lastname', 'email', 'phone', 'hubspot_owner_id',
          'candidate_experience', 'candidate_date_of_joining', 
          'candidate_name', 'candidate_past_company'
        ],
        limit
      };

      // Build filters if provided
      if (Object.keys(filters).length > 0) {
        const filterArray = [];
        
        Object.entries(filters).forEach(([property, value]) => {
          if (value !== undefined && value !== null) {
            filterArray.push({
              propertyName: property,
              operator: 'EQ',
              value: value.toString()
            });
          }
        });

        if (filterArray.length > 0) {
          searchPayload.filterGroups.push({ filters: filterArray });
        }
      }

      const response = await axios.post(
        `${this.baseUrl}${config.endpoints.contactsSearch}`,
        searchPayload,
        { headers: this.headers }
      );

      logger.success('Contacts search completed', {
        total: response.data.total,
        returned: response.data.results.length
      });

      return {
        success: true,
        contacts: response.data.results,
        total: response.data.total
      };

    } catch (error) {
      logger.error('Failed to search contacts', error);
      throw {
        success: false,
        error: error.message,
        details: error.response?.data || null
      };
    }
  }

  // Delete contact (optional - for testing purposes)
  async deleteContact(contactId) {
    try {
      logger.info(`Deleting contact ${contactId}`);

      await axios.delete(
        `${this.baseUrl}${config.endpoints.contacts}/${contactId}`,
        { headers: this.headers }
      );

      logger.success('Contact deleted successfully', { contactId });

      return {
        success: true,
        contactId
      };

    } catch (error) {
      logger.error(`Failed to delete contact ${contactId}`, error);
      throw {
        success: false,
        error: error.message,
        details: error.response?.data || null
      };
    }
  }

  // Batch create contacts (bonus feature)
  async batchCreateContacts(contactsData) {
    try {
      logger.info(`Batch creating ${contactsData.length} contacts`);

      const inputs = contactsData.map(contactData => ({
        properties: {
          firstname: contactData.firstName,
          lastname: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          hubspot_owner_id: contactData.ownerId,
          candidate_experience: contactData.candidateExperience,
          candidate_date_of_joining: contactData.candidateDateOfJoining,
          candidate_name: contactData.candidateName,
          candidate_past_company: contactData.candidatePastCompany
        }
      }));

      const response = await axios.post(
        `${this.baseUrl}${config.endpoints.contactsBatch}/create`,
        { inputs },
        { headers: this.headers }
      );

      logger.success('Batch contact creation completed', {
        created: response.data.results.length
      });

      return {
        success: true,
        contacts: response.data.results
      };

    } catch (error) {
      logger.error('Failed to batch create contacts', error);
      throw {
        success: false,
        error: error.message,
        details: error.response?.data || null
      };
    }
  }
}

module.exports = HubSpotService;