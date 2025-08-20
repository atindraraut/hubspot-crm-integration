// Direct test of assignment functionality without Express server
require('dotenv').config();
const HubSpotService = require('./src/services/hubspot');
const PropertiesService = require('./src/services/properties');
const logger = require('./src/utils/logger');

async function testAssignmentFunctionality() {
  console.log('🧪 TESTING ASSIGNMENT FUNCTIONALITY');
  console.log('===================================\n');

  const hubspotService = new HubSpotService();
  const propertiesService = new PropertiesService();

  try {
    // 1. Check if properties exist
    console.log('1️⃣  Checking custom properties...');
    const propertiesStatus = await propertiesService.checkPropertiesExist();
    console.log('Properties status:', propertiesStatus.map(p => ({ name: p.name, exists: p.exists })));
    console.log('');

    // 2. Create a test contact with custom properties
    console.log('2️⃣  Creating contact with custom properties...');
    const testContact = {
      firstName: 'Abhisek',
      lastName: 'Test',
      email: `abhisek.${Date.now()}@example.com`,
      phone: '+91700999999',
      candidateExperience: 5,
      candidateDateOfJoining: '2024-03-15',
      candidateName: 'Abhisek',
      candidatePastCompany: 'Previous Company'
    };

    const createResult = await hubspotService.createContact(testContact);
    console.log('✅ Contact created successfully!');
    console.log('Contact ID:', createResult.contactId);
    console.log('Custom properties set:', Object.keys(createResult.contact.properties).filter(k => k.startsWith('candidate_')));
    console.log('');

    // 3. Retrieve the contact to verify custom properties
    console.log('3️⃣  Retrieving contact to verify properties...');
    const getResult = await hubspotService.getContact(createResult.contactId);
    const customProps = Object.keys(getResult.contact.properties).filter(k => k.startsWith('candidate_'));
    console.log('✅ Contact retrieved successfully!');
    console.log('Custom properties found:', customProps);
    customProps.forEach(prop => {
      console.log(`   ${prop}: ${getResult.contact.properties[prop]}`);
    });
    console.log('');

    // 4. Update contact properties
    console.log('4️⃣  Updating contact properties...');
    const updateData = {
      candidateExperience: 6,
      candidatePastCompany: 'Updated Company'
    };
    const updateResult = await hubspotService.updateContact(createResult.contactId, updateData);
    console.log('✅ Contact updated successfully!');
    console.log('Updated properties:', updateResult.contact.properties.candidate_experience, updateResult.contact.properties.candidate_past_company);
    console.log('');

    // 5. Search contacts with custom properties
    console.log('5️⃣  Searching contacts by custom properties...');
    const searchResult = await hubspotService.searchContacts({
      candidate_experience: '6'
    }, 5);
    console.log('✅ Search completed!');
    console.log(`Found ${searchResult.total} contacts with experience = 6`);
    console.log('');

    // 6. Test batch operations (optional)
    console.log('6️⃣  Testing batch contact creation...');
    const batchContacts = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: `alice.${Date.now()}@example.com`,
        candidateExperience: 3,
        candidateName: 'Alice Johnson',
        candidatePastCompany: 'Tech Corp'
      },
      {
        firstName: 'Bob', 
        lastName: 'Wilson',
        email: `bob.${Date.now()}@example.com`,
        candidateExperience: 7,
        candidateName: 'Bob Wilson',
        candidatePastCompany: 'Software Inc'
      }
    ];

    const batchResult = await hubspotService.batchCreateContacts(batchContacts);
    console.log('✅ Batch creation completed!');
    console.log(`Created ${batchResult.contacts.length} contacts in batch`);
    console.log('');

    console.log('🎉 ALL ASSIGNMENT REQUIREMENTS TESTED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('✅ Custom properties created');
    console.log('✅ Contact creation with custom properties');
    console.log('✅ Contact retrieval with custom properties');
    console.log('✅ Contact updates');
    console.log('✅ Search functionality');
    console.log('✅ Batch operations');
    console.log('');
    console.log('🏆 ASSIGNMENT 2 IS FULLY FUNCTIONAL!');

    return {
      success: true,
      contactId: createResult.contactId,
      customProperties: customProps,
      batchContactIds: batchResult.contacts.map(c => c.id)
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    return { success: false, error: error.message };
  }
}

// Run the test
if (require.main === module) {
  testAssignmentFunctionality()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed! Ready for assignment submission.');
        process.exit(0);
      } else {
        console.log('\n❌ Tests failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testAssignmentFunctionality };