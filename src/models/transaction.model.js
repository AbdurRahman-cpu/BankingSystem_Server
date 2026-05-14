const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'account',
        required : [true,'Transaction must be associated with from account'],
        index : true
    },
    toAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'account',
        required : [true,'Transaction must be associated with to account'],
        index : true
    },
    status : {
        type : String,
        enum : {
            values : ['pending','completed','failed','reserved'],
            message : 'status can be either completed or failed or reserved'
        }
    },
    amount :{
        type : Number,
        required :[true,'Min amount required 1INR'],
        min : [0]
    },
    idempotencyKey : {
        type : String,
        required : [true,'required fro any transaction'],
        index : true,
        unique : true
    }
},{timestamps:true})

const transactionModel = mongoose.model('transaction',transactionSchema)

module.exports = transactionModel