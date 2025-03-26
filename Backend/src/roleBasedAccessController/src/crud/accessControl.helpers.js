const { param, query, body, validationResult } = require("express-validator")
const { duplicateKeyOrInvalidParentId, permissionsCount, updateRoleValidations } = require("./accessControl.models")

exports.groupPermissions = rows => {
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

exports.stringValidator = (key, location = 'body', optional = false) => {
    return readyParameter(key, optional, location)
        .isString().withMessage(`${key} must be a string`)
        .trim()
        .isLength({ min: 1 }).withMessage('Key cannot be empty')
}

exports.permissionKeyValidator = (key, location = 'body', optional = false) => {
    return readyParameter(key, optional, location)
        .isString().withMessage(`${key} must be a string`)
        .trim()
        .custom(value => !/\s/.test(value)).withMessage('Key must not contain whitespace')
        .isLength({ min: 1 }).withMessage(`${key} cannot be empty`)
}

exports.idValidator = (key, location = 'body', optional = false) => {
    return readyParameter(key, optional, location)
        .isString().withMessage(`${key} must be a string`)
        .isLength({ min: 36, max: 36 }).withMessage(`Invalid ${key}`)
}

exports.arrayValidator = (key, location = 'body', optional = false) => {
    return readyParameter(key, optional, location)
        .isArray().withMessage(`${key} must be an Array`)
        .custom((value) => {
            const subjectSet = new Set(value)
    
            if (value.length !== subjectSet.size) {
                throw new Error(`One or more duplicate items in ${key}`)
            }
        
            return true
        })
}

exports.checkPermissionsExist = async (value) => {
    try {
        const [rows] = await permissionsCount(value)

        if (rows[0].count !== value.length) {
            customError("One of more permissions don't exist")
        } 

        return true

    } catch (err) {
        handleError(err)
    }
}

exports.addPermissionCustomValidator = async (value) => {
    try {
        const { key, parentId } = value

        const [rows] = await duplicateKeyOrInvalidParentId(key, parentId)

        for (const row of rows) {
            const invalid = row.count === 1

            if (!invalid) continue

            if (row.status === 'duplicate') {
                throw customError('Duplicate Permission')
            } else if (row.status === 'invalidParent') {
                throw customError('Invalid ParentId')
            } else {
                throw customError('Invalid Values')
            }
        }

        return true
    } catch (err) {
        handleError(err)
    }
}

exports.updatePermissionsCustomValidator = async (value) => {
    try {
        const { roleId, roleName, addPermissions, removePermissions } = value

        if (addPermissions && removePermissions) {
            const common = new Set([...addPermissions].filter(x => removePermissions.includes(x)))
            
            if (common.size) {
                customError('One or more duplicate permissionsIds')
            }
        }

        if (!roleName && !addPermissions && !removePermissions) {
            customError("Atleast one field is required")
        }

        const [rows] = await updateRoleValidations(roleName, roleId, addPermissions)
        
        for (const row of rows) {
            switch (row.title) {
                case 'roleExists':
                    if (!row.count) customError('Invalid RoleId')
                    break
                case 'duplicateRoleName':
                    if (row.count) customError('Role name already exists')
                    break;
                case 'permissionsExists':
                    if (row.count < addPermissions.length) customError('One or more invalid permission Ids')
                    break;
                case 'duplicateAdditions':
                    if (row.count) customError('One or more permissions already present in role')
                    break;
            }
        }

    } catch (err) {
        handleError(err)
    }
}

exports.validationError = (req, res, next) => {
    const vs = validationResult(req)
    
    if (vs.errors.length) {
        return res.status(400).send({ message: vs.errors[0].msg })
    }

    next()
}

const readyParameter = (key, optional, location) => {
    let result;

    switch (location) {
        case 'param':
            result = param(key)
            break;

        case 'query':
            result = query(key)
            break

        default:
            result = body(key)
            break;
    }

    return optional ? result.optional() : result.notEmpty().withMessage(`${key} is requried`)
}

const handleError = (err) => {
    if (err.isMine) {
        throw err
    }
    else {
        console.log(err)
        throw new Error('An unexpected Error Occured')
    }
}

const customError = (msg) => {
    const err = new Error(msg)
    err.isMine = true
    throw err
}