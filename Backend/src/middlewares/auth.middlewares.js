const jwt = require('jsonwebtoken');

exports.checkToken = async (req, res, next) => {
    const token = req.headers['authorization']

    const result = jwt.decode(token, process.env.JWT_KEY)

    if (!result) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    req.decoded = result

    req.roleId = result.roleId

    next()
}