const { body } = require('express-validator');
const { permissionKeyValidator, idValidator, stringValidator, addPermissionCustomValidator } = require('./accessControl.helpers');

exports.addPermission = [
    permissionKeyValidator('key'),
    idValidator('parentId'),
    idValidator('parentId')
]

exports.updatePermission = [
    permissionKeyValidator('key'),
    idValidator('permissionId')
]

exports.deletePermission = [
    idValidator('permissionId')
]

exports.createRole = [
    stringValidator('roleName'),
    idValidator('permissions.*')
]

exports.deleteRole = [
    idValidator('roleId')
]

exports.updateRole = [
    idValidator('roleId'),
    idValidator('addPermissions.*'),
    idValidator('removePermissions.*')
]