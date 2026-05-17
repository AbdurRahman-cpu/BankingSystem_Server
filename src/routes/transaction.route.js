const express = require('express')
const route = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const transactionController = require('../controllers/transaction.controller')

route.post('/',authMiddleware.authMiddleware,transactionController.transactionController)
route.post('/sif',authMiddleware.authSystemUserMiddleware,transactionController.fundAccountController)

module.exports = route