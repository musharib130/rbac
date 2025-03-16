const { setSqlPromisePool } = require('./src/accessControl.models')
const rbacRouter = require('./src/accessControl.routes')
const RoleBasedAccessControl = require('./src/RoleBasedAccessControl')

const initRbac = (redis, sql) => {

    // add test connections logics to validate if correct objects are passed //

    const roleBasedAccessControl = new RoleBasedAccessControl(redis, sql)
    setSqlPromisePool(sql)

    return roleBasedAccessControl()
}

module.exports = { rbacRouter, initRbac }