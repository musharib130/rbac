const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controllers');
const { checkToken } = require('../middlewares/auth.middlewares');

const { updateRole, createRole } = require('../roleBasedAccessController/src/crud/accessControl.validators');
const { validationResult } = require('express-validator');
const roleBasedAccessControl = require('../config/rbac');

router.post('/login', authController.login)
router.post('/register', authController.register)


router.get(
    '/validateToken', 
    updateRole,
    (req, res) => {
        const vs = validationResult(req)

        if (vs.errors.length) {
            return res.status(400).send({ message: vs.errors[0].msg })
        }

        res.status(200).send('Hello World!')
    }
)


router.post('/forgotPassword', (req, res) => res.status(200).send('Hello World!'))
router.post('/resetPassword', (req, res) => res.status(200).send('Hello World!'))


module.exports = router;