const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userSchema =new  mongoose.Schema({
    email:{
        type : String,
        required : [true,'email required'],
        trim : true,
        lowercase : true,
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
        unique : true
    },
    name:{
        type : String,
        required : [true,'name required']
    },
    password:{
        type : String,
        required : [true,'password required'],
        minlength : [6,'must be min 6 chars'],
        select : false
    },
    systemUser:{
        type : Boolean,
        immutable : true,
        default : false,
        select : false
    }
},{timestamps:true})
userSchema.pre("save",async function(){
    if(! this.isModified("password")){
        return
    }
    const Hash = await bcrypt.hash(this.password,10)
    this.password = Hash

})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema)
module.exports = userModel