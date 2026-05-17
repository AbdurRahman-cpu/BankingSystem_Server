const accountModel = require('../models/account.model')
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const emailService = require('../services/email.service')
const userModel = require('../models/user.model')
const mongoose = require('mongoose')
const env = require('dotenv')

async function transactionController(req,res){
    const {fromAccount,toAccount,amount,idempotencyKey} = req.body
    // 1.validate request
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(401).json({
            message : 'enter all details for an transaction'
        })
    }
    const isFromAccountExists = await accountModel.findOne({
        _id : fromAccount
    })
    const isToAccountExists = await accountModel.findOne({
        _id : toAccount
    })
    if(!isFromAccountExists || !isToAccountExists){
        return res.status(400).json({
            message : 'invalid accounts'
        })
    }

    //2.check is transaction already exists
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })

    // 3.check transaction status
    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === 'completed'){
            return res.status(200).json({
                message : 'Transaction completed'
            })
        }
        if(isTransactionAlreadyExists.status === 'pending'){
            return res.status(200).json({
                message : 'Transaction on the way'
            })
        }
        if(isTransactionAlreadyExists.status === 'failed'){
            return res.status(500).json({
                message : 'Transaction failed,retry'
            })
        }
        if(isTransactionAlreadyExists.status === 'reversed'){
            return res.status(200).json({
                message : 'Transaction reversed,retry'
            })
        }
    }
    if(isFromAccountExists.status !== 'Active' || isToAccountExists.status !== 'Active'){
        return res.status(200).json({
            message : 'above one or both account not in active state'
        })
    }
    const balance = await isFromAccountExists.getBalance()

    // 4.drive sender balance from ledger
    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance current balance is  ${balance} requested balance ${amount}`
        })
    }

    // 5.Create transaction

    const session = await mongoose.startSession()
    session.startTransaction()
    const transaction = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status : 'pending'
    }],{session})

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount : amount,
        transaction: transaction._id,
        type : 'debited'
    }],{session})
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount : amount,
        transaction: transaction._id,
        type : 'credited'
    }],{session})

    transaction.status = 'completed'
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    // send transaction email
    const senderUser = await userModel.findById(isFromAccountExists.user)
    const receiverUser = await userModel.findById(isToAccountExists.user)

    await emailService.sendMail({
        from: process.env.GMAIL,
        to: senderUser.email,
        subject: 'Transaction Successful',
        text: `₹${amount} transferred successfully to account ${toAccount}`
    })

    await emailService.sendMail({
        from: process.env.GMAIL,
        to: receiverUser.email,
        subject: 'Money Received',
        text: `₹${amount} received from account ${fromAccount}`
    })

    return res.status(201).json({
        messages : 'Transaction completed Successfully'
    })
}

async function fundAccountController(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "pending"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "debited"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "credited"
    } ], { session })

    transaction.status = "completed"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })
}

module.exports = {transactionController,fundAccountController}