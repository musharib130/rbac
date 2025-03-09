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