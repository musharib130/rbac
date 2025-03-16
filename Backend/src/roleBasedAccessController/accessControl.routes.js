const express = require('express');
const router = express.Router();
const accessControlControllers = require('./accessControl.controllers');

/////////////////////
// Pemissions CRUD //
/////////////////////

// Get all permissions
router.get('/permissions', accessControlControllers.getAllPermissions);

// Create new permissions
router.post('/permission', accessControlControllers.addPermission);

// Update a permission
router.patch('/permission', accessControlControllers.updatePermissionKey);

// Delete a permission
router.delete('/permission', accessControlControllers.deletePermission);

////////////////
// Roles CRUD //
////////////////

// Get all roles 
router.get('/roles', accessControlControllers.getAllRoles);

// get role with details
router.get('/role/:id', accessControlControllers.getRoleDetails)

// Create a new role
router.post('/role', accessControlControllers.createRole);

// Update a role
router.patch('/role', accessControlControllers.updateRole);

// Delete a role
router.delete('/role', accessControlControllers.deleteRole);

module.exports = router;