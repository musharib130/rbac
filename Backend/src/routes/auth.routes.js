const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controllers')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/validateToken', (req, res) => res.status(200).send('Hello World!'))
router.post('/forgotPassword', (req, res) => res.status(200).send('Hello World!'))
router.post('/resetPassword', (req, res) => res.status(200).send('Hello World!'))


module.exports = router;