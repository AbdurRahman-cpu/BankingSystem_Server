const jwt = require('jsonwebtoken')
const env = require('dotenv')
const User = require('../models/user.model')
async function authMiddleWare(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
            return res.status(401).json({
                message : "Unauthorized access , token is missing"
            })
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRETKEY)
        const user = await User.findById(decoded.userID)
        req.user = user
        next()
    }catch (e) {
        return  res.status(401).json({
            message : "Unauthorized access , token is invalid"
        })
    }
}

module.exports = {authMiddleWare}