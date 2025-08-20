const express = require('express');
const PropertiesService = require('../services/properties');
const logger = require('../utils/logger');

const router = express.Router();
const propertiesService = new PropertiesService();

// GET /api/properties - Get all custom properties status
router.get('/', async (req, res) => {
  try {
    logger.info('API: Checking custom properties status');

    const properties = await propertiesService.checkPropertiesExist();
    
    res.json({
      success: true,
      data: {
        properties,
        summary: {
          total: properties.length,
          existing: properties.filter(p => p.exists).length,
          missing: properties.filter(p => !p.exists).length
        }
      }
    });

  } catch (error) {
    logger.error('API: Failed to check properties', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/properties - Create individual custom property
router.post('/', async (req, res) => {
  try {
    logger.info('API: Creating individual custom property');

    const { name, label, type, fieldType, description, groupName } = req.body;

    // Validate required fields
    if (!name || !label || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, label, and type are required'
      });
    }

    // Build property definition
    const propertyDefinition = {
      name,
      label,
      type,
      fieldType: fieldType || (type === 'string' ? 'text' : type),
      description: description || `Custom property: ${label}`,
      groupName: groupName || 'contactinformation'
    };

    const result = await propertiesService.createProperty(propertyDefinition);
    
    res.status(201).json({
      success: true,
      message: 'Custom property created successfully',
      data: result
    });

  } catch (error) {
    logger.error('API: Failed to create property', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/properties/setup - Create all custom properties
router.post('/setup', async (req, res) => {
  try {
    logger.info('API: Setting up custom properties');

    const results = await propertiesService.createAllCustomProperties();
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    res.status(summary.failed > 0 ? 207 : 201).json({
      success: summary.failed === 0,
      message: summary.failed === 0 ? 'All properties created successfully' : 'Some properties failed to create',
      data: {
        results,
        summary
      }
    });

  } catch (error) {
    logger.error('API: Failed to setup properties', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// GET /api/properties/:name - Get specific property details
router.get('/:name', async (req, res) => {
  try {
    const propertyName = req.params.name;
    logger.info(`API: Getting property details for ${propertyName}`);

    const property = await propertiesService.getProperty(propertyName);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
        propertyName
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    logger.error(`API: Failed to get property ${req.params.name}`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;