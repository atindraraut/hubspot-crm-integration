const express = require('express');
const HubSpotService = require('../services/hubspot');
const logger = require('../utils/logger');

const router = express.Router();
const hubspotService = new HubSpotService();

// Validation middleware
const validateContactData = (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: firstName, lastName, and email are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  next();
};

// POST /api/contacts - Create new contact
router.post('/', validateContactData, async (req, res) => {
  try {
    logger.info('API: Creating new contact', req.body);

    const contactData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      ownerId: req.body.ownerId,
      candidateExperience: req.body.candidateExperience,
      candidateDateOfJoining: req.body.candidateDateOfJoining,
      candidateName: req.body.candidateName,
      candidatePastCompany: req.body.candidatePastCompany
    };

    const result = await hubspotService.createContact(contactData);
    
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: {
        contactId: result.contactId,
        properties: result.contact.properties
      }
    });

  } catch (error) {
    logger.error('API: Failed to create contact', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Internal server error',
      details: error.details || null
    });
  }
});

// GET /api/contacts/:id - Get contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    logger.info(`API: Retrieving contact ${contactId}`);

    const result = await hubspotService.getContact(contactId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
        contactId
      });
    }

    res.json({
      success: true,
      data: {
        contactId: result.contact.id,
        properties: result.contact.properties,
        createdAt: result.contact.createdAt,
        updatedAt: result.contact.updatedAt
      }
    });

  } catch (error) {
    logger.error(`API: Failed to retrieve contact ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: error.error || 'Internal server error',
      details: error.details || null
    });
  }
});

// PATCH /api/contacts/:id - Update contact
router.patch('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    logger.info(`API: Updating contact ${contactId}`, req.body);

    // Build update data object
    const updateData = {};
    
    // Map request body to update data
    if (req.body.firstName !== undefined) updateData.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) updateData.lastName = req.body.lastName;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.ownerId !== undefined) updateData.ownerId = req.body.ownerId;
    if (req.body.candidateExperience !== undefined) updateData.candidateExperience = req.body.candidateExperience;
    if (req.body.candidateDateOfJoining !== undefined) updateData.candidateDateOfJoining = req.body.candidateDateOfJoining;
    if (req.body.candidateName !== undefined) updateData.candidateName = req.body.candidateName;
    if (req.body.candidatePastCompany !== undefined) updateData.candidatePastCompany = req.body.candidatePastCompany;

    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update provided'
      });
    }

    const result = await hubspotService.updateContact(contactId, updateData);
    
    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: {
        contactId: result.contactId,
        updatedProperties: Object.keys(updateData),
        properties: result.contact.properties
      }
    });

  } catch (error) {
    logger.error(`API: Failed to update contact ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: error.error || 'Internal server error',
      details: error.details || null
    });
  }
});

// GET /api/contacts - Search contacts with filters
router.get('/', async (req, res) => {
  try {
    logger.info('API: Searching contacts', req.query);

    const filters = {};
    const limit = parseInt(req.query.limit) || 10;

    // Build filters from query parameters
    if (req.query.firstName) filters.firstname = req.query.firstName;
    if (req.query.lastName) filters.lastname = req.query.lastName;
    if (req.query.email) filters.email = req.query.email;
    if (req.query.ownerId) filters.hubspot_owner_id = req.query.ownerId;
    if (req.query.candidateExperience) filters.candidate_experience = req.query.candidateExperience;
    if (req.query.candidatePastCompany) filters.candidate_past_company = req.query.candidatePastCompany;

    const result = await hubspotService.searchContacts(filters, limit);
    
    res.json({
      success: true,
      data: {
        contacts: result.contacts.map(contact => ({
          contactId: contact.id,
          properties: contact.properties,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt
        })),
        total: result.total,
        limit,
        filters: filters
      }
    });

  } catch (error) {
    logger.error('API: Failed to search contacts', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Internal server error',
      details: error.details || null
    });
  }
});

// DELETE /api/contacts/:id - Delete contact (for testing purposes)
router.delete('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    logger.info(`API: Deleting contact ${contactId}`);

    const result = await hubspotService.deleteContact(contactId);
    
    res.json({
      success: true,
      message: 'Contact deleted successfully',
      contactId: result.contactId
    });

  } catch (error) {
    logger.error(`API: Failed to delete contact ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: error.error || 'Internal server error',
      details: error.details || null
    });
  }
});

// POST /api/contacts/batch - Batch create contacts
router.post('/batch', async (req, res) => {
  try {
    logger.info('API: Batch creating contacts', { count: req.body.contacts?.length });

    if (!req.body.contacts || !Array.isArray(req.body.contacts)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must contain a "contacts" array'
      });
    }

    // Validate each contact
    for (let i = 0; i < req.body.contacts.length; i++) {
      const contact = req.body.contacts[i];
      if (!contact.firstName || !contact.lastName || !contact.email) {
        return res.status(400).json({
          success: false,
          error: `Contact at index ${i} is missing required fields (firstName, lastName, email)`
        });
      }
    }

    const result = await hubspotService.batchCreateContacts(req.body.contacts);
    
    res.status(201).json({
      success: true,
      message: 'Contacts created successfully',
      data: {
        created: result.contacts.length,
        contacts: result.contacts.map(contact => ({
          contactId: contact.id,
          properties: contact.properties
        }))
      }
    });

  } catch (error) {
    logger.error('API: Failed to batch create contacts', error);
    res.status(500).json({
      success: false,
      error: error.error || 'Internal server error',
      details: error.details || null
    });
  }
});

module.exports = router;