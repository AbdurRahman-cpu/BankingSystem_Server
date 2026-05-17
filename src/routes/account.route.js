const express = require('express')
const accountController = require('../controllers/account.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const route = express.Router()

route.post('/create',authMiddleware.authMiddleware,accountController.createAccountController)
route.get('/AllUserAccounts',authMiddleware.authMiddleware,accountController.showAccounts)
route.get('/checkBalance',authMiddleware.authMiddleware,accountController.checkBalance)

module.exports = route