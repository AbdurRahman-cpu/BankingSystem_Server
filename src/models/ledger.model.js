const mongoose = require('mongoose')

const ledgerSchema = new mongoose.Schema({
    account : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'account',
        required :[true,"Ledger must be associated with an account"],
        index : true,
        immutable : true
    },
    amount :{
        type : Number,
        required :[true,'Amount required for creating ledger entry'],
        immutable : true
    },
    transaction : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'transaction',
        required :[true,"Ledger must be associated with an transaction"],
        index : true,
        immutable : true
    },
    type : {
        type : String,
        enum : {
            values : ['credited','debited'],
            message : 'amount either be credited or debited'
        },
        required :[true,"Ledger type required"],
        immutable : true
    }
})

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified")
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification)
ledgerSchema.pre("findOneAndDelete", preventLedgerModification)
ledgerSchema.pre("deleteOne", preventLedgerModification)
ledgerSchema.pre("updateOne", preventLedgerModification)
ledgerSchema.pre("deleteMany", preventLedgerModification)
ledgerSchema.pre("updateMany", preventLedgerModification)
ledgerSchema.pre("findOneAndReplace", preventLedgerModification)

const ledgerModel = mongoose.model('ledger',ledgerSchema)

module.exports = ledgerModel