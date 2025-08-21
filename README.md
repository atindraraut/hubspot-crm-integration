# HubSpot Backend Integration project

**Developer:** Atindra Raut
**Email:** atindraraut80@gmail.com
**Date:** August 2025
**project:** Backend Integration & HubSpot Automation
**Technology:** Node.js, Express.js, HubSpot API v3

---

## Introduction

Working on this HubSpot project has been quite the learning experience! When I first read through the requirements, I thought it would be relatively straightforward - set up some webhooks and create a few API endpoints. However, as I started diving deeper into the implementation, I discovered there were actually quite a few interesting technical challenges that made this project much more engaging than I initially expected.

The project consisted of two main components: first, creating an automated webhook system that triggers whenever contacts get assigned to owners in HubSpot, and second, building a complete API system for managing custom contact properties. Let me walk you through my approach, the challenges I encountered, and what I learned throughout this process.

## Part 1: Webhook Automation Implementation

### Understanding the Requirements

The first part required me to create a system that automatically sends webhook notifications when contact ownership changes in HubSpot. The webhook needed to send a POST request to webhook.site with a specific JSON payload format containing candidate information.

### My Implementation Strategy

Initially, I was planning to build a complex backend system that would listen for HubSpot webhook events and then process them accordingly. But after spending some time researching HubSpot's capabilities, I discovered that they have this really sophisticated built-in workflow system that can handle this type of automation natively. This seemed like a much more elegant solution than building everything from scratch.

### How I Set It Up

**Step 1: Creating the HubSpot Workflow**
I logged into HubSpot and navigated to the Automation section. Created a new contact-based workflow and gave it a descriptive name. The tricky part was configuring the trigger condition correctly - it needed to fire whenever the Contact Owner property gets assigned or updated, not just when contacts are created.

**Step 2: Configuring the Webhook Action**
Added a webhook action that sends a POST request to webhook.site. I had to be really careful about the JSON payload format since the project specified exactly what it should look like:

```json
{
  "Candidate_name": "Abhisek",
  "Candidate_number": "+91700999999"
}
```

**Step 3: Using HubSpot Personalization Tokens**
This was actually the most challenging part initially. I used HubSpot's personalization tokens to dynamically pull the contact's information. The syntax is `{{ contact.firstname }}` and `{{ contact.phone }}`, which gets replaced with the actual contact data when the webhook fires.

**Step 4: Testing the Implementation**
Created a test contact with the exact name and phone number specified in the project. When I assigned it to an owner, I could immediately see the webhook firing on webhook.site with the correct data format. It was pretty satisfying to see it work exactly as intended!

### Why This Approach Makes Sense

Using HubSpot's native workflow system has several key advantages:

- It's built into the platform, so it's incredibly reliable
- No need to maintain custom server infrastructure for this functionality
- Triggers happen in real-time with minimal latency
- Easy to modify or debug through the HubSpot interface
- Scales automatically with HubSpot's infrastructure

I also implemented a custom Node.js solution as an alternative approach, but honestly, the native workflow method is much more practical for this specific use case.

## Part 2: Custom Properties and API Development

This is where the project got really interesting from a technical standpoint. I needed to create four specific custom properties in HubSpot and then build a comprehensive REST API to manage contacts with these properties.

### The Custom Properties Challenge

The project required these four specific properties:

- `candidate_experience` (Number) - years of professional experience
- `candidate_date_of_joining` (Date) - expected start date
- `candidate_name` (Text) - full candidate name
- `candidate_past_company` (Text) - previous employer

Creating these through the HubSpot API turned out to be more involved than I initially anticipated. You can't just specify a name and type - you also need to define the field type, description, property group, and various other metadata. I decided to put them all in the "contactinformation" group since that seemed most appropriate.

### Building the API Architecture

For the backend implementation, I chose Node.js with Express because I'm comfortable with that technology stack and it integrates well with HubSpot's REST API. However, I really focused on creating a clean, maintainable architecture rather than just getting something working quickly.

**Project Organization:**
I structured the project with clear separation of concerns:

- **Services:** Handle all HubSpot API communication and business logic
- **Routes:** Manage HTTP requests and responses
- **Config:** Environment variables and system validation
- **Utils:** Logging and helper functions

This modular approach made the code much easier to debug and maintain as I added features.

### API Endpoints I Developed

**Properties Management:**

- `GET /api/properties` - Shows status of all custom properties
- `POST /api/properties` - Creates individual custom properties (bonus feature)
- `POST /api/properties/setup` - Creates all four project properties at once
- `GET /api/properties/:name` - Gets details about a specific property

**Contact Management:**

- `POST /api/contacts` - Creates new contacts with custom properties
- `GET /api/contacts/:id` - Retrieves contact by ID
- `PATCH /api/contacts/:id` - Updates existing contact properties
- `GET /api/contacts` - Searches contacts with various filters
- `POST /api/contacts/batch` - Creates multiple contacts simultaneously (bonus feature)

### Technical Challenges I Encountered

**Authentication Configuration:**
Getting the HubSpot Private App tokens configured correctly took me longer than I'd like to admit. I had to ensure I had all the necessary scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.schemas.contacts.read`, and `crm.schemas.contacts.write`. The schema scopes were particularly important for creating custom properties, which I didn't realize initially.

**Input Validation and Data Handling:**
I spent considerable time implementing proper input validation. This includes email format verification, required field checking, data type validation, and handling various edge cases where users might send malformed requests.

**Comprehensive Error Handling:**
This was probably the most time-consuming aspect of the development. I wanted to ensure that when something goes wrong, users receive helpful, actionable error messages rather than generic server errors or application crashes.

**Environment Configuration Management:**
I developed a comprehensive system that validates your environment setup when the application starts. It checks whether your HubSpot token has the correct format, validates the required scopes, and provides clear instructions if something needs to be fixed.

### Real-World Examples

Here are some actual examples of how the API works in practice:

**Creating a Contact:**

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Abhisek",
    "lastName": "Candidate",
    "email": "abhisek@example.com", 
    "phone": "+91700999999",
    "candidateExperience": 5,
    "candidateDateOfJoining": "2024-03-15",
    "candidateName": "Abhisek",
    "candidatePastCompany": "Google Inc."
  }'
```

This creates a contact in HubSpot with all the custom properties properly populated. The API returns the contact ID and confirms all the property values that were successfully set.

**Updating Contact Properties:**

```bash
curl -X PATCH http://localhost:3000/api/contacts/213589987003 \
  -H "Content-Type: application/json" \
  -d '{
    "candidateExperience": 6,
    "candidatePastCompany": "Meta (Facebook)"
  }'
```

This updates only the specified fields for an existing contact without affecting any other properties.

## Testing and Quality Assurance

I'm quite particular about testing, so I developed several different validation scripts to ensure everything works correctly:

### Automated Testing Suite

**Environment Validation:**
Created a script that verifies your HubSpot token format and scope configuration. This actually saved me hours of debugging time because it catches configuration issues before you even start testing the functionality.

**End-to-End Functionality Testing:**
Built a comprehensive script that executes the entire workflow - creates custom properties, creates a test contact, retrieves it, updates properties, searches for contacts, and tests batch operations. Watching it all work seamlessly is quite satisfying.

**Individual Endpoint Testing:**
Developed another script that systematically tests every API endpoint to ensure they respond correctly and handle various error conditions appropriately.

### Test Results

When everything is working properly, the test output looks like this:

```
🎉 ALL project REQUIREMENTS TESTED SUCCESSFULLY!
==================================================
✅ Custom properties created
✅ Contact creation with custom properties
✅ Contact retrieval with custom properties  
✅ Contact updates
✅ Search functionality
✅ Batch operations

🏆 project 2 IS FULLY FUNCTIONAL!
```

## Documentation and Developer Experience

I invested significant effort in making the system as developer-friendly as possible:

**Comprehensive README Documentation:**
Complete setup instructions, detailed API documentation with examples, troubleshooting guides, and clear explanation of the project architecture.

**Command-Line Examples:**
Ready-to-use cURL examples for every endpoint so developers can test functionality manually without needing additional tools.

**Postman Collection:**
A complete collection that can be imported directly into Postman, including environment variables and automated test scripts.

**Extensive Code Documentation:**
I commented the code thoroughly so other developers (or future me) can understand the logic and make modifications easily.

## Going Beyond the Requirements

While working on this project, I found myself implementing additional features that weren't strictly required but seemed valuable for a real-world application:

**Individual Property Creation:**
The project only specified the four required properties, but I thought it would be useful to support creating arbitrary custom properties through the API for future extensibility.

**Batch Contact Operations:**
The ability to create multiple contacts simultaneously seemed essential for any production use case where you might need to import contact lists.

**Advanced Search Capabilities:**
Implemented the ability to filter contacts by multiple custom properties with various search criteria.

**System Health Monitoring:**
Added health check endpoints and comprehensive logging so the system can be monitored effectively in a production environment.

**Robust Configuration Validation:**
That comprehensive validation system I mentioned that checks your setup and provides helpful guidance when things are misconfigured.

## Challenges and Learning Experiences

### Technical Learning Curve

**HubSpot API Exploration:**
This was my first experience working with HubSpot's API ecosystem, so there was definitely a learning curve involved. The documentation is generally quite good, but understanding concepts like property groups, field types, and workflow personalization tokens required some experimentation.

**Authentication and Scope Management:**
I probably spent more time than necessary debugging authentication issues before I fully understood the scope requirements for creating custom properties. This taught me the importance of carefully reading API documentation before starting implementation.

**Webhook Payload Formatting:**
Getting the exact JSON format correct for the webhook project required several iterations. HubSpot's personalization tokens have some nuances that aren't immediately obvious from the documentation.

**Error Handling Complexity:**
Ensuring the API gracefully handles all possible failure scenarios (invalid tokens, network issues, malformed requests, HubSpot API errors, rate limiting) was more complex than I initially anticipated.

### What I Learned

This project provided valuable learning opportunities in several areas:

**API Design Principles:**
I significantly improved my understanding of designing clean, RESTful APIs with proper error handling, input validation, and consistent response formats.

**Platform Integration:**
Gained deep knowledge of how HubSpot's workflows, properties, and API systems work together. The platform is actually quite powerful once you understand its architecture.

**Documentation Best Practices:**
Learned that writing comprehensive documentation during development is much more efficient than trying to document everything after the fact.

**Testing Strategy:**
Having automated tests saved enormous amounts of time, especially when refactoring code or adding new features. This is definitely a practice I'll continue in future projects.

## Results and Evidence

The complete system is functioning perfectly. Here's what I've successfully implemented:

- All four custom properties created and visible in HubSpot interface
- Contacts being created with all custom properties properly populated
- Webhook automation firing correctly whenever contact owners are assigned
- Complete REST API handling all CRUD operations smoothly
- Comprehensive test coverage demonstrating reliable functionality

I thoroughly tested everything using real data, including creating a contact with ID 213589987003 (named "Abhisek Test" with phone "+91700999999"), and all the custom properties are displaying correctly in the HubSpot interface.

## Production Readiness

What I'm particularly proud of is that this isn't just a proof-of-concept - it's actually production-ready code. The solution includes:

- Proper error handling with user-friendly error messages
- Security considerations including input validation and token protection
- Comprehensive logging for monitoring and debugging purposes
- Automated testing to ensure ongoing reliability
- Detailed documentation for maintenance and future development

If this were being deployed to a production environment, I might add some additional monitoring capabilities and implement rate limiting, but otherwise it's ready for real-world use.

## Technical Specifications

For reference, here are the key technical details:

**Technology Stack:**

- Node.js with Express.js framework
- HubSpot API v3 integration
- Environment configuration with comprehensive validation
- Professional logging and error handling system
- Automated testing suite

**Authentication:**

- HubSpot Private App tokens with proper scope configuration
- Token format validation and security checks

**Required API Scopes:**

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.schemas.contacts.read`
- `crm.schemas.contacts.write`

**Project Structure:**

```
hubspot-project2/
├── src/
│   ├── config/           # Configuration and validation
│   ├── services/         # HubSpot API integration layer
│   ├── routes/           # Express API route handlers
│   ├── utils/            # Logging and utility functions
│   └── setup.js          # Automated property setup
├── examples/             # JSON test files and examples
├── docs/                 # Comprehensive documentation
└── tests/                # Automated validation scripts
```

## Quick Setup Instructions

1. Run `npm install` to install all dependencies
2. Copy `.env.example` to `.env` and add your HubSpot access token
3. Run `npm run setup` to create the custom properties
4. Run `npm start` to launch the API server
5. Use the provided test scripts to verify everything works correctly

The entire system is ready to run and test immediately after following these setup steps.

## Conclusion

This project turned out to be much more engaging and educational than I initially expected. I started with what seemed like a straightforward integration project and ended up building something that's genuinely sophisticated and production-ready.

The most rewarding moment was seeing the webhook automation work end-to-end for the first time. Creating a contact in HubSpot, assigning an owner, and immediately seeing the webhook fire with the exact data format specified in the project - that was really satisfying.

The API system also evolved into something much more robust than I originally planned. It not only handles all the project requirements but also includes additional features that would be valuable in real-world business scenarios.

This project effectively combined workflow automation with API development in an interesting way, and I definitely learned a lot about both HubSpot's platform capabilities and best practices for building integration systems.

Thank you for providing such an engaging project that challenged me to think about both technical implementation details and overall user experience. I really enjoyed working on something that feels like it could be genuinely useful in a real business context!

---
