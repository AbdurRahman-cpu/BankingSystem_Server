const mongoose = require('mongoose')

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

const accountModel = mongoose.model('account',accountSchema)

module.exports = accountModel