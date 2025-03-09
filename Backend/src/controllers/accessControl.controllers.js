const accessControlModels = require('../models/accessControl.models')
const accessControlHelpers = require('../helpers/accessControl.helpers')

exports.getAllPermissions = async (req, res, next) => {
    try {
        const [rows] = await accessControlModels.getAllPermissions()

        const result = accessControlHelpers.groupPermissions(rows)

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

exports.addPermission = async (req, res, next) => {
    try {

        const { key, parentId } = req.body

        if (!key || typeof (key) !== 'string' || !key.length) {
            return res.status(400).json({ message: 'Invalid Key' })
        }

        const UUID = await accessControlModels.addPermission(key, parentId)

        res.status(201).json({
            message: "Permission added successfully",
            permissionId: UUID
        })
    } catch (err) {
        next(err)
    }
}

exports.updatePermissionKey = async (req, res, next) => {
    try {
        const { permissionId, key } = req.body

        if (!permissionId || typeof (permissionId) !== 'string' || permissionId.length !== 36) {
            return res.status(400).json({ message: 'Invalid PermissionId' })
        }

        if (!key || typeof (key) !== 'string' || !key.length) {
            return res.status(400).json({ message: 'Invalid Permission Key' })
        }

        await accessControlModels.updatePermissionKey(permissionId, key)

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

exports.deletePermission = async (req, res, next) => {
    try {
        const { permissionId } = req.body

        if (!permissionId || typeof (permissionId) !== 'string' || permissionId.length !== 36) {
            return res.status(400).json({ message: 'Invalid PermissionId' })
        }

        await accessControlModels.deletePermission(permissionId)

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

exports.getAllRoles = async (req, res, next) => {
    try {
        const [rows] = await accessControlModels.getAllRoles()

        res.status(200).json(rows)
    } catch (err) {
        next(err)
    }
}

exports.getRoleDetails = async (req, res, next) => {
    try {
        const roleId = req.params.id

        const [role] = await accessControlModels.getRoleDetails(roleId)

        if (!role.length) {
            return res.status(404).json({ message: 'Role not found' })
        }

        const roleDetails = {
            roleId: role[0].roleId,
            roleName: role[0].roleName,
            permissions: !role[0].permissionId ? [] : accessControlHelpers.groupPermissions(role.map(row => {
                return {
                    permissionId: row.permissionId,
                    permissionKey: row.permissionKey,
                    parentId: row.parentId
                }
            }))
        }

        const [permissionsRows] = await accessControlModels.getAllPermissions()

        const permissions = accessControlHelpers.groupPermissions(permissionsRows)

        res.status(200).json({ roleDetails, permissions })
    } catch (err) {
        next(err)
    }
}

exports.createRole = async (req, res, next) => {
    try {
        const { roleName, permissions } = req.body

        if (!roleName || typeof (roleName) !== 'string' || !roleName.length) {
            return res.status(400).json({ message: 'Invalid Role Name' })
        }

        if (!permissions || !Array.isArray(permissions) || !permissions.length || permissions.some(permission => typeof(permission) !== 'string' || permission.length !== 36)) {
            return res.status(400).json({ message: 'Invalid Permission' })
        }

        const roleId = await accessControlModels.addRole(roleName, permissions)

        res.status(201).json({
            message: 'Role created successfully',
            roleId: roleId
        })

    } catch (err) {
        next(err)
    }
}

exports.deleteRole = async (req, res, next) => {
    try {
        const { roleId} = req.body

        if (!roleId || typeof (roleId) !== 'string' || roleId.length !== 36) {
            return res.status(400).json({ message: 'Invalid Role Id' })
        }

        await accessControlModels.deleteRole(roleId)

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

exports.updateRole = async (req, res, next) => {
    try {
        const { roleId, roleName, addPermissions, removePermissions } = req.body
        
        if (!roleId || typeof (roleId) !== 'string' || roleId.length !== 36) {
            return res.status(400).json({ message: 'Invalid Role Id' })
        }

        if (roleName && (typeof(roleName) !== 'string' || !roleName.length)) {
            return res.status(400).json({ message: 'Invalid Role Name'})
        }

        if (addPermissions && (!Array.isArray(addPermissions) || !addPermissions.length || addPermissions.some(permission => typeof(permission) !== 'string' || permission.length !== 36))) {
            return res.status(400).json({ message: 'Invalid Add Permissions'})
        }

        if (removePermissions && (!Array.isArray(removePermissions) || !removePermissions.length || removePermissions.some(permission => typeof(permission) !== 'string' || permission.length !== 36))) {
            return res.status(400).json({ message: 'Invalid Add Permissions'})
        }

        await accessControlModels.updateRole(roleId, roleName, addPermissions, removePermissions)

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}