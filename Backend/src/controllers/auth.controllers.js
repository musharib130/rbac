// it is assumed that email data is validated //
// Still need to implement Express Validator to validate the body //

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authModels = require("../models/auth.models")

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        const passHash = await bcrypt.hash(password, 10)

        const roleId = process.env.DEFAULT_ROLE_ID

        const userId = await authModels.addUser(name, email, passHash, roleId)

        const token = jwt.sign({
            userId, 
            roleId
        }, process.env.JWT_KEY, { expiresIn: '1h' })

        res.status(200).json({ token })
    } catch (err) {
        next(err)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const [user] = await authModels.getUser(email)

        if (!user.length) {
            return res.status(404).json({ message: 'Incorrect email or password' })
        }

        try {
            bcrypt.compare(password, user[0].password)
        } catch (err) {
            return res.status(404).json({ message: 'Incorrect email or password' })
        }

        const token = jwt.sign({
            userId: user[0].userId,
            roleId: user[0].roleId
        }, process.env.JWT_KEY, { expiresIn: '1h' })

        res.status(201).json({ token })

    } catch (err) {
        next(err)
    }
}