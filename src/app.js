const express = require('express')
const authRouter = require('./routes/auth.routes')
const accountRouter = require('./routes/account.route')
const transactionRouter = require('./routes/transaction.route')
const app = express()
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRouter)
app.use('/api/account',accountRouter)
app.use('/api/transaction',transactionRouter)

module.exports = app