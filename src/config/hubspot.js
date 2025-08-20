require('dotenv').config();

// Required environment variables
const REQUIRED_ENV_VARS = [
  {
    name: 'HUBSPOT_ACCESS_TOKEN',
    description: 'HubSpot Private App access token',
    validator: (value) => {
      if (!value) return 'Token is required';
      if (typeof value !== 'string') return 'Token must be a string';
      if (value.length < 20) return 'Token appears to be too short (minimum 20 characters)';
      if (!value.startsWith('pat-')) return 'Token should start with "pat-" for Private App tokens';
      return null; // Valid
    }
  }
];

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = [
  {
    name: 'HUBSPOT_BASE_URL',
    default: 'https://api.hubapi.com',
    description: 'HubSpot API base URL',
    validator: (value) => {
      if (value && !value.startsWith('https://')) return 'Base URL must start with https://';
      return null;
    }
  },
  {
    name: 'PORT',
    default: '3000',
    description: 'Server port number',
    validator: (value) => {
      if (value && isNaN(parseInt(value))) return 'Port must be a valid number';
      const port = parseInt(value);
      if (port < 1 || port > 65535) return 'Port must be between 1 and 65535';
      return null;
    }
  }
];

// Environment validation function
function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const config = {};

  console.log('🔍 Validating environment configuration...\n');

  // Validate required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name];
    const error = envVar.validator ? envVar.validator(value) : (!value ? 'Required variable missing' : null);
    
    if (error) {
      errors.push({
        variable: envVar.name,
        error,
        description: envVar.description
      });
    } else {
      console.log(`✅ ${envVar.name}: Valid`);
      config[envVar.name] = value;
    }
  }

  // Validate optional variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = process.env[envVar.name] || envVar.default;
    const error = envVar.validator ? envVar.validator(value) : null;
    
    if (error) {
      warnings.push({
        variable: envVar.name,
        error,
        description: envVar.description,
        default: envVar.default
      });
    } else {
      const isDefault = !process.env[envVar.name];
      console.log(`${isDefault ? '🔧' : '✅'} ${envVar.name}: ${isDefault ? `Using default (${value})` : 'Valid'}`);
      config[envVar.name] = value;
    }
  }

  console.log('');

  // Display warnings
  if (warnings.length > 0) {
    console.log('⚠️  Configuration Warnings:');
    warnings.forEach(warning => {
      console.log(`   ${warning.variable}: ${warning.error}`);
      console.log(`   Description: ${warning.description}`);
      if (warning.default) {
        console.log(`   Using default: ${warning.default}`);
      }
    });
    console.log('');
  }

  // Display errors and exit if any
  if (errors.length > 0) {
    console.error('❌ Configuration Errors:');
    errors.forEach(error => {
      console.error(`   ${error.variable}: ${error.error}`);
      console.error(`   Description: ${error.description}`);
    });
    console.error('\n💡 Setup Instructions:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Add your HubSpot Private App access token');
    console.error('3. Ensure the token has required scopes:');
    console.error('   - crm.objects.contacts.read');
    console.error('   - crm.objects.contacts.write');
    console.error('   - crm.schemas.contacts.read');
    console.error('   - crm.schemas.contacts.write');
    throw new Error(`Environment validation failed: ${errors.length} error(s) found`);
  }

  console.log('✅ Environment validation passed!\n');
  return config;
}

// Validate environment on module load
const envConfig = validateEnvironment();

// Application configuration
const config = {
  // Environment variables
  accessToken: envConfig.HUBSPOT_ACCESS_TOKEN,
  baseUrl: envConfig.HUBSPOT_BASE_URL,
  port: parseInt(envConfig.PORT),
  
  // API endpoints
  endpoints: {
    // CRM Objects API
    contacts: '/crm/v3/objects/contacts',
    contactsSearch: '/crm/v3/objects/contacts/search',
    contactsBatch: '/crm/v3/objects/contacts/batch',
    
    // Properties API
    properties: '/crm/v3/properties/contacts',
    
    // Owners API  
    owners: '/crm/v3/owners',
    
    // Schemas API (for property management)
    schemas: '/crm/v3/schemas/contacts'
  },

  // Required scopes for reference
  requiredScopes: [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.schemas.contacts.read',
    'crm.schemas.contacts.write'
  ],

  // Optional scopes
  optionalScopes: [
    'crm.objects.owners.read'
  ],

  // Configuration summary
  getSummary() {
    return {
      baseUrl: this.baseUrl,
      tokenLength: this.accessToken ? this.accessToken.length : 0,
      tokenPrefix: this.accessToken ? this.accessToken.substring(0, 8) + '...' : 'MISSING',
      port: this.port,
      endpointsCount: Object.keys(this.endpoints).length,
      requiredScopes: this.requiredScopes,
      optionalScopes: this.optionalScopes
    };
  }
};

// Additional validation for runtime checks
config.validate = () => {
  if (!config.accessToken) {
    throw new Error('Configuration error: HubSpot access token is missing');
  }
  
  if (!config.baseUrl.startsWith('https://')) {
    throw new Error('Configuration error: Base URL must use HTTPS');
  }
  
  return true;
};

module.exports = config;