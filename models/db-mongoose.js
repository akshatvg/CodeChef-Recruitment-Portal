var mongoose = require('mongoose')
var validator = require('validator')

var users = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(user) {
            if (!validator.isEmail(user)) {
                throw new Error('invalid email')
            }
        }
    },
    phone: {
        type: String,
        required: true,
        maxlength: 10
    },
    regno: {
        type: String,
        required: true,
        maxlength: 9
    },
<<<<<<< HEAD
    password: {
        type: String,
        required: true
=======
    password:{
        type:String,
        required:true
>>>>>>> f0bb97afab077e13339abc821e3a6606791c56db
    }
})

var userRegister = mongoose.model('userRegister', users)

module.exports = userRegister