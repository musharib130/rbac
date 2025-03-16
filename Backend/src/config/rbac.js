const RoleBasedAccessControl = require('../roleBasedAccessController/RoleBasedAccessControl');
const redisClient = require('./redis');
const sqlClient = require('./db');
const { setSqlPromisePool } = require('../roleBasedAccessController/accessControl.models');

// Create the singleton instance of RoleBasedAccessControl
const roleBasedAccessControl = new RoleBasedAccessControl(redisClient, sqlClient);
setSqlPromisePool(sqlClient)

module.exports = roleBasedAccessControl;