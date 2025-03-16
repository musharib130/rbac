const { body } = require('express-validator');
const { permissionKeyValidator, idValidator, stringValidator, addPermissionCustomValidator, arrayValidator, checkDuplicationInArray, checkPermissionsExist, updatePermissionsCustomValidator } = require('./accessControl.helpers');

exports.addPermission = [
    permissionKeyValidator('key'),
    idValidator('parentId', 'body', true),
    body().custom(addPermissionCustomValidator)
]

exports.updatePermission = [
    permissionKeyValidator('key'),
    idValidator('permissionId')
]

exports.idInParam = [
    idValidator('id', 'param')
]

exports.createRole = [
    stringValidator('roleName'),
    arrayValidator('permissions'),
    idValidator('permissions.*'),
    body('permissions').custom(checkPermissionsExist)
]

//todo
exports.updateRole = [
    idValidator('roleId'),
    stringValidator('roleName', 'body', true),
    arrayValidator('addPermissions', 'body', true),
    arrayValidator('removePermissions', 'body', true),
    idValidator('addPermissions.*'),
    idValidator('removePermissions.*'),
    body().custom(updatePermissionsCustomValidator)
]