const axios = require('axios');
const config = require('../config/hubspot');
const logger = require('../utils/logger');

class PropertiesService {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Define the 4 custom properties as per assignment requirements
  getCustomPropertiesDefinitions() {
    return [
      {
        name: 'candidate_experience',
        label: 'Candidate Experience',
        description: 'Years of professional experience',
        groupName: 'contactinformation',
        type: 'number',
        fieldType: 'number'
      },
      {
        name: 'candidate_date_of_joining',
        label: 'Candidate Date of Joining',
        description: 'Expected or actual date of joining',
        groupName: 'contactinformation',
        type: 'date',
        fieldType: 'date'
      },
      {
        name: 'candidate_name',
        label: 'Candidate Name',
        description: 'Full name of the candidate',
        groupName: 'contactinformation',
        type: 'string',
        fieldType: 'text'
      },
      {
        name: 'candidate_past_company',
        label: 'Candidate Past Company',
        description: 'Previous company or current employer',
        groupName: 'contactinformation',
        type: 'string',
        fieldType: 'text'
      }
    ];
  }

  async createProperty(propertyDefinition) {
    try {
      logger.info(`Creating property: ${propertyDefinition.name}`);
      
      const response = await axios.post(
        `${this.baseUrl}${config.endpoints.properties}`,
        propertyDefinition,
        { headers: this.headers }
      );

      logger.success(`Property created successfully: ${propertyDefinition.name}`, {
        name: response.data.name,
        label: response.data.label,
        type: response.data.type
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        logger.info(`Property already exists: ${propertyDefinition.name}`);
        return { name: propertyDefinition.name, status: 'already_exists' };
      } else {
        logger.error(`Failed to create property: ${propertyDefinition.name}`, error);
        throw error;
      }
    }
  }

  async createAllCustomProperties() {
    const properties = this.getCustomPropertiesDefinitions();
    const results = [];

    logger.info('Starting custom properties creation process...');

    for (const property of properties) {
      try {
        const result = await this.createProperty(property);
        results.push({
          name: property.name,
          success: true,
          data: result
        });
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          name: property.name,
          success: false,
          error: error.message
        });
      }
    }

    logger.success('Custom properties creation completed', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

    return results;
  }

  async getProperty(propertyName) {
    try {
      const response = await axios.get(
        `${this.baseUrl}${config.endpoints.properties}/${propertyName}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async checkPropertiesExist() {
    const properties = this.getCustomPropertiesDefinitions();
    const results = [];

    for (const property of properties) {
      try {
        const exists = await this.getProperty(property.name);
        results.push({
          name: property.name,
          exists: !!exists,
          data: exists
        });
      } catch (error) {
        results.push({
          name: property.name,
          exists: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = PropertiesService;