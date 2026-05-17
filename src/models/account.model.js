const mongoose = require('mongoose')
const ledgerModel = require('./ledger.model')
const accountSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : [true,'Account must be associated with user'],
        index : true // For Fast retrieval

    },
    status : {
        type : String,
        enum : {
            values : ["Active","Frozen","Closed"],
            message : 'Status can be active or frozen or closed'
        },
        default : 'Active'
    },
    currency : {
        type : String,
        required : [true,'currency required for creating account'],
        default : 'INR'
    }

},{timestamps : true})

accountSchema.index({user:1,status:1}) // for retrieval using compound index means with user & status
accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "debited"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "credited"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }
    ])
    return balanceData.length > 0 ? balanceData[0].balance : 0
}
const accountModel = mongoose.model('account',accountSchema)

module.exports = accountModel