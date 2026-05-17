const accountModel = require('../models/account.model')

async function createAccountController(req, res) {

    const user = req.user

    const account = await accountModel.create({
        user: user._id
    })

    return res.status(201).json({
        account,
        message: 'account created'
    })
}

async function showAccounts(req, res) {

    const accounts = await accountModel.find({
        user: req.user._id
    })

    return res.status(200).json({
        accounts,
        message: '😘'
    })
}

async function checkBalance(req, res) {

    const { aid } = req.body

    const account = await accountModel.findOne({
        _id: aid,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: 'account not found'
        })
    }

    const balance =await account.getBalance()

    return res.status(200).json({
        message: `Balance : ${balance}`
    })
}

module.exports = {
    createAccountController,
    showAccounts,
    checkBalance
}