const { v1: uuid } = require('uuid');

let sql;

exports.setSqlPromisePool = (pool) => {
    sql = pool
}

exports.getAllPermissions = () => {
    return sql.query('SELECT * FROM permissions');
}

exports.addPermission = async (key, parent) => {
    const UUID = uuid();

    await sql.query(
        'INSERT INTO permissions (permissionId, permissionKey, parentId) VALUES (?, ?, ?)',
        [UUID, key, parent]
    );

    return UUID;
}

exports.updatePermissionKey = (permissionId, name) => {
    return sql.query('UPDATE permissions SET permissionKey = ? WHERE permissionId = ?', [name, permissionId]);
}

exports.deletePermission = (permissionId) => {
    return sql.query('DELETE FROM permissions WHERE permissionId = ?', [permissionId]);
}

exports.getAllRoles = () => {
    return sql.query('SELECT * FROM roles')
}

exports.getRoleDetails = (roleId) => {
    return sql.query(
        `SELECT roles.roleId, roles.roleName, permissions.permissionId, permissions.permissionKey, permissions.parentId FROM roles
        LEFT JOIN rolepermissions ON roles.roleId = rolepermissions.roleId
        LEFT JOIN permissions ON rolepermissions.permissionId = permissions.permissionId
        WHERE roles.roleId = ?`,
        [roleId]
    )
}

exports.addRole = async (roleName, permissions) => {
    let connection;

    try {
        connection = await sql.getConnection()

        await connection.beginTransaction()

        const roleId = uuid()

        await connection.query('INSERT INTO roles (roleId, roleName) VALUES (?, ?)', [roleId, roleName])

        await connection.query('INSERT INTO rolepermissions (roleId, permissionId) VALUES ?', [permissions.map(permission => [roleId, permission])])

        connection.commit()

        return roleId
    } catch (err) {
        if (connection) connection.rollback()

        throw (err)
    } finally {
        connection.release()
    }
}

exports.deleteRole = (roleId) => {
    return sql.query('DELETE FROM roles WHERE roleId = ?', [roleId])
}

exports.updateRole = async (roleId, roleName, permissionsAdd, permissionsRemove) => {
    let connection;

    try {
        connection = await sql.getConnection()

        await connection.beginTransaction()

        if (roleName) {
            await connection.query('UPDATE roles SET roleName = ? WHERE roleId = ?', [roleName, roleId])
        }

        if (permissionsAdd) {
            await connection.query('INSERT INTO rolepermissions (roleId, permissionId) VALUES ?', [permissionsAdd.map(permission => [roleId, permission])])
        }

        if (permissionsRemove) {
            await connection.query('DELETE FROM rolepermissions WHERE roleId = ? AND permissionId IN (?)', [roleId, permissionsRemove])
        }

        connection.commit()
    } catch (err) {
        if (connection) {
            connection.rollback()
        }

        throw (err)
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

exports.duplicateKeyOrInvalidParentId = (key, parentId) => {

    const pair = `${key}${parentId ?? ''}`

    let query = `(SELECT 'duplicate' AS status, COUNT(*) AS count FROM permissions
        WHERE CONCAT(permissionKey, IFNULL(parentId, '')) = ?)`

    const params = [pair]

    if (parentId) {
        query += `
            UNION ALL 
            (SELECT 'invalidParent' AS status, 1 - COUNT(*) AS count FROM permissions
            WHERE permissionId = ?)`
    
        params.push(parentId)
    }

    return sql.query(query, params)
}


exports.updateRoleValidations = (roleName, roleId, addPermissions) => {

    let query = `(SELECT 'roleExists' AS title, count(*) AS count FROM roles WHERE roleId = ?)`

    let params = [roleId]

    if (roleName) {
        query += `UNION ALL
        (SELECT 'duplicateRoleName' AS title, count(*) AS count FROM roles WHERE roleName = ?)`

        params = [...params, roleName]
    }

    if (addPermissions) {
        query += `UNION ALL
        (SELECT 'permissionsExists' AS title, count(*) as count FROM permissions WHERE permissionId IN (?))
        UNION ALL
        (SELECT 'duplicateAdditions' AS title, count(*) AS count FROM rolepermissions WHERE roleId = ? AND permissionId IN (?))`

        params = [...params, addPermissions, roleId, addPermissions]
    }

    return sql.query(query, params)
}

exports.permissionsCount = (permissionIds) => {
    return sql.query(
        `SELECT count(*) as count FROM permissions WHERE permissionId IN (?)`,
        [permissionIds]
    )
}