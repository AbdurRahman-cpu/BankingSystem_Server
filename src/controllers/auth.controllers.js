const userModel = require('../models/user.model')
const tokenBlackListModel = require("../models/blackList.model")
const jwt = require('jsonwebtoken')
const env = require('dotenv')
const bcrypt = require('bcrypt')
const Trans = require('../services/email.service')

async function UserRegister(req,res){

    const {email,name,password} = req.body

    const isUserExists = await userModel.findOne({
        email:email
    })

    if(isUserExists){
        return res.status(409).json({
            message : 'User already exists',
            status : 'failed'
        })
    }

    const user = await userModel.create({
        email,
        name,
        password
    })

    await Trans.sendMail({
        from : process.env.GMAIL,
        to : email,
        subject : "Registered Successfully into AR BANK",
        text : `Hello ${name}, your account has been created successfully`
    })

    const token = jwt.sign(
        { userID: user._id },
        process.env.JWT_SECRETKEY
    )
    res.cookie('token',token)

    res.status(200).json({
        message : 'user registered successfully'
    })
}

async function UserLogin(req, res) {
    try {
        const { email, name, password } = req.body

        const isUserExists = await userModel.findOne({
            $or: [{ email }, { name }]
        }).select('+password')

        if (!isUserExists) {
            return res.status(401).json({ message: 'Enter valid credentials' })
        }

        const IsPassValid = await bcrypt.compare(password, isUserExists.password)

        if (!IsPassValid) {
            return res.status(401).json({ message: 'Enter valid password' })
        }

        const token = jwt.sign({
            userID: isUserExists._id
        }, process.env.JWT_SECRETKEY)

        res.cookie('token', token)
        res.status(200).json({ message: 'user logged in successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }



    await tokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })

}

module.exports = {UserRegister,UserLogin,userLogoutController}