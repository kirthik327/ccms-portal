const mongoose = require('mongoose');

// Mock mongoose connection so we can load files without a running MongoDB server
mongoose.connect = async () => {
  console.log('[MOCK] Mongoose connection bypass for compilation testing.');
  return {
    connection: { host: 'localhost-mock' }
  };
};

console.log('--- STARTING BACKEND COMPILATION TEST ---');

try {
  console.log('Loading User model...');
  require('../models/User');
  console.log('Loading Complaint model...');
  require('../models/Complaint');

  console.log('Loading authController...');
  require('../controllers/authController');
  console.log('Loading complaintController...');
  require('../controllers/complaintController');
  console.log('Loading adminController...');
  require('../controllers/adminController');

  console.log('Loading authMiddleware...');
  require('../middleware/authMiddleware');
  console.log('Loading uploadMiddleware...');
  require('../middleware/uploadMiddleware');

  console.log('Loading routes...');
  require('../routes/authRoutes');
  require('../routes/complaintRoutes');
  require('../routes/adminRoutes');

  console.log('Loading main server.js entrypoint (without starting listening)...');
  // Set env vars so server.js doesn't crash on port binding or db connection failure logs
  process.env.PORT = 5999;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/mock';
  
  // We won't require server.js directly if it starts listening immediately,
  // but we can load app logic or just check the main entry syntax.
  const fs = require('fs');
  const path = require('path');
  const serverPath = path.join(__dirname, '../server.js');
  const code = fs.readFileSync(serverPath, 'utf8');
  
  // Execute a syntax check using Node's parser
  const vm = require('vm');
  new vm.Script(code);
  console.log('server.js syntax verification completed.');

  console.log('\n=============================================');
  console.log('SUCCESS: All backend files compiled cleanly!');
  console.log('=============================================\n');
  process.exit(0);
} catch (error) {
  console.error('\n=============================================');
  console.error('FAILURE: Compilation test failed with error:');
  console.error(error.stack);
  console.error('=============================================\n');
  process.exit(1);
}
