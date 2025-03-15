const sql = require('../config/db')
const { v1: uuid } = require('uuid');

exports.addUser = async (displayName, email, password, roleId) => {
    const UUID = uuid()

    await sql.query('INSERT INTO users (userId, displayName, email, password, roleId) VALUES (?, ?, ?, ?, ?)', [UUID, displayName, email, password, roleId])

    return UUID
}

exports.getUser = (email) => {
    return sql.query(
        `SELECT userId, displayName, roleId, password FROM users WHERE email = ?`,
        [email]
    )
}
