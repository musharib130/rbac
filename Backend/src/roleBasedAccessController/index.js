class RoleBasedAccessControl {

    constructor(redis, sql) {
        this.redis = redis
        this.sql = sql
    }

    roleUpdated(roleId) {
        return this.redis.del(roleId)
    }

    permissionsUpdated() {
        return this.redis.flushDb()
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
        
        console.log(roleId, permission)
        const hasKey = await this.redis.exists(roleId)

        if (!hasKey) {
            await this.setRole(roleId)
        }

        return this.redis.sIsMember(roleId, permission)
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
                this.redis.sAdd(roleId, 'not-a-role')
                this.redis.expire(roleId, 60)
                return 
            }

            const groupedPermissions = this.groupPermissions(rows)

            this.addPermissionToRole(roleId, groupedPermissions)

        } catch(error) {
            console.log(error)
        }
    }

    addPermissionToRole(roleId, permissions, str = '') {
        for (const permission of permissions) {
            const permissionStr = str + `${str.length ? ':' : ''}` + permission.permissionKey

            this.redis.sAdd(roleId, permissionStr)

            this.addPermissionToRole(roleId, permission.childern, permissionStr)
        }
    }

    groupPermissions = rows => {
        const groupedRows = new Map()
    
        const permissionsMap = new Map()
    
        rows.forEach(row => {
            if (groupedRows.has(row.parentId)) {
                groupedRows.get(row.parentId).push(row)
            } else {
                groupedRows.set(row.parentId, [row])
            }
    
            row.childern = []
    
            permissionsMap.set(row.permissionId, row)
        })
    
        groupedRows.forEach((value, key) => {
            if (!key) return
    
            permissionsMap.get(key).childern = value
        })
    
        return groupedRows.get(null)
    }
}

module.exports = RoleBasedAccessControl