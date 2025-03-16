const redisClient = require('./redis');
const sqlClient = require('./db');
const { initRbac } = require('../roleBasedAccessController');

// Create the singleton instance of RoleBasedAccessControl
const roleBasedAccessControl = initRbac(redisClient, sqlClient);

module.exports = roleBasedAccessControl;