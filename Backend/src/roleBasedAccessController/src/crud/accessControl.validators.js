const { permissionKeyValidator, idValidator, stringValidator } = require('./accessControl.helpers');

exports.addPermission = [
    permissionKeyValidator('key'),
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