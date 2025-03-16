const { setSqlPromisePool } = require('./src/crud/accessControl.models')
const rbacRouter = require('./src/crud/accessControl.routes')
const RoleBasedAccessControl = require('./src/RbacCore/RoleBasedAccessControl')

const initRbac = (redis, sql) => {

    // add test connections logics to validate if correct objects are passed //

    const roleBasedAccessControl = new RoleBasedAccessControl(redis, sql)
    setSqlPromisePool(sql)

    return roleBasedAccessControl
}

module.exports = { rbacRouter, initRbac }