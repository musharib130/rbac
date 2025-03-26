const express = require('express');
const router = express.Router();
const accessControlControllers = require('./accessControl.controllers');
const accessControlValidators = require('./accessControl.validators');
const { validationError } = require('./accessControl.helpers');

/////////////////////
// Pemissions CRUD //
/////////////////////

// Get all permissions
router.get('/permissions', accessControlControllers.getAllPermissions);

// Create new permissions
router.post(
    '/permission',  
    accessControlValidators.addPermission,
    validationError,
    accessControlControllers.addPermission
);

// Update a permission
router.patch(
    '/permission', 
    accessControlValidators.updatePermission,
    validationError,
    accessControlControllers.updatePermissionKey
);

// Delete a permission
router.delete(
    '/permission/:id', 
    accessControlValidators.idInParam,
    validationError,
    accessControlControllers.deletePermission
);

////////////////
// Roles CRUD //
////////////////

// Get all roles 
router.get('/roles', accessControlControllers.getAllRoles);

// get role with details
router.get(
    '/role/:id', 
    accessControlValidators.idInParam,
    validationError,
    accessControlControllers.getRoleDetails
)

// Create a new role
router.post(
    '/role', 
    accessControlValidators.createRole,
    validationError,
    accessControlControllers.createRole
);

// Update a role
router.patch(
    '/role', 
    accessControlValidators.updateRole,
    validationError,
    accessControlControllers.updateRole
);

// Delete a role
router.delete(
    '/role/:id', 
    accessControlValidators.idInParam,
    validationError,
    accessControlControllers.deleteRole
);

module.exports = router;