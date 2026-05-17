const express = require('express')
const route = express.Router()
const authController = require('../controllers/auth.controllers')
route.post('/register',authController.UserRegister)
route.post('/login',authController.UserLogin)
route.post('/logout',authController.userLogoutController)
module.exports = route