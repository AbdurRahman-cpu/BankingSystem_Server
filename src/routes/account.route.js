const express = require('express')
const accountController = require('../controllers/account.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const route = express.Router()

route.post('/create',authMiddleware.authMiddleWare,accountController.createAccountController)

module.exports = route