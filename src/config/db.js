const mongoose = require('mongoose')
const env = require('dotenv').config()
async function connectDB(){
    await mongoose.connect(process.env.MONGODB_URL)
        .then(()=>{
            console.log("connected to database")
            }
        )
        .catch(()=>{
            console.log("Cant connect to database")
        })
}

module.exports = connectDB