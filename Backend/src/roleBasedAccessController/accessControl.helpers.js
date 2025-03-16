const { param, query, body } = require("express-validator")

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
