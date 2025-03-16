const { groupPermissions } = require("../crud/accessControl.helpers")

class RoleBasedAccessControl {

    constructor(redis, sql) {
        this.redis = redis
        this.sql = sql
    }

    roleUpdated(roleId) {
        return this.redis.del(this.redisRoleKey(roleId))
    }

    async permissionsUpdated() {
        let cursor = '0';
        do {
            const reply = await this.redis.scan(cursor, {
                MATCH: 'roleId:',
                COUNT: 100,
            });
            cursor = reply.cursor;
            const keys = reply.keys;

            if (keys.length > 0) {
                await client.unlink(keys);
            }
        } while (cursor !== '0');
    }

    hasPermissionMiddleware(permission) {
        return async (req, res, next) => {
            const hasPermission = await this.hasPermission(req.roleId, permission)

            if (hasPermission) {
                next()
            } else {
                res.status(403).json({ message: 'Forbidden' })
            }
        }
    }

    async hasPermission(roleId, permission) {

        const hasKey = await this.redis.exists(this.redisRoleKey(roleId))

        if (!hasKey) {
            await this.setRole(roleId)
        }

        return this.redis.sIsMember(this.redisRoleKey(roleId), permission)
    }

    async setRole(roleId) {
        try {
            const [rows] = await this.sql.query(
                `SELECT rp.roleId, p.permissionId, p.permissionKey, parentId  
                FROM rolepermissions rp
                LEFT JOIN permissions p ON rp.permissionId = p.permissionId 
                WHERE rp.roleId = ?`,
                [roleId]
            )

            if (!rows.length) {
                return this.redis.multi()
                    .sAdd(this.redisRoleKey(roleId), 'not-a-role')
                    .expire(this.redisRoleKey(roleId), 60)
                    .execAsync()
            }

            const groupedPermissions = groupPermissions(rows)

            const pList = this.addPermissionToRole(roleId, groupedPermissions)

            await this.redis.sAdd(this.redisRoleKey(roleId), pList)
        } catch (error) {
            console.log(error)
        }
    }

    addPermissionToRole(roleId, permissions, str = '', pList = []) {
        for (const permission of permissions) {
            const permissionStr = str + `${str.length ? ':' : ''}` + permission.permissionKey

            pList.push(permissionStr)

            this.addPermissionToRole(roleId, permission.childern, permissionStr, pList)

            return pList
        }
    }

    redisRoleKey(roleId) {
        return `roleId:${roleId}`
    }
}

module.exports = RoleBasedAccessControl