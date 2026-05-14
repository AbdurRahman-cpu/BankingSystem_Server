const app = require('./src/app')
require('dotenv').config()

const DB = require('./src/config/db')
DB()

app.listen(3000,()=>{
    console.log("Server running on port 3000")
})