const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controllers');
const { checkToken } = require('../middlewares/auth.middlewares');

const rbac = require('../config/rbac')

router.post('/login', authController.login)
router.post('/register', authController.register)


router.get(
    '/validateToken', 
    checkToken, 
    rbac.hasPermissionMiddleware('permissions:update'), 
    (req, res) => res.status(200).send('Hello World!')
)


router.post('/forgotPassword', (req, res) => res.status(200).send('Hello World!'))
router.post('/resetPassword', (req, res) => res.status(200).send('Hello World!'))


module.exports = router;