const RoleBasedAccessControl = require('../roleBasedAccessController/index');
const redisClient = require('./redis');
const sqlClient = require('./db');

// Create the singleton instance of RoleBasedAccessControl
const roleBasedAccessControl = new RoleBasedAccessControl(redisClient, sqlClient);

module.exports = roleBasedAccessControl;