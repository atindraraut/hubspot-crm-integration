const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    if (error) {
      console.error('Error details:', error.message);
      if (error.response?.data) {
        console.error('API Error:', JSON.stringify(error.response.data, null, 2));
      }
    }
  },
  
  success: (message, data = null) => {
    console.log(`[SUCCESS] ${new Date().toISOString()}: ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }
};

module.exports = logger;