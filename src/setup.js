const PropertiesService = require('./services/properties');
const logger = require('./utils/logger');

async function setupCustomProperties() {
  try {
    logger.info('=== HubSpot Custom Properties Setup ===');
    
    const propertiesService = new PropertiesService();
    
    // First, check which properties already exist
    logger.info('Checking existing properties...');
    const existingProperties = await propertiesService.checkPropertiesExist();
    
    logger.info('Property status:', existingProperties);
    
    // Create all custom properties
    const results = await propertiesService.createAllCustomProperties();
    
    // Summary
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results
    };
    
    logger.success('Setup completed!', summary);
    
    if (summary.failed > 0) {
      logger.error('Some properties failed to create. Please check the errors above.');
      process.exit(1);
    } else {
      logger.success('All custom properties are ready!');
      process.exit(0);
    }
    
  } catch (error) {
    logger.error('Setup failed', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupCustomProperties();
}

module.exports = { setupCustomProperties };