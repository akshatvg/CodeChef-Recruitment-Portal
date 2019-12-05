var mongoose = require('mongoose')

var data = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
<<<<<<< HEAD
    message: {
        type: String
    },
    date: {
        type: Date
=======
    message:{
        type:String
    },
    date:{
        type:Date
>>>>>>> f0bb97afab077e13339abc821e3a6606791c56db
    }
})

var contactUs = mongoose.model('contactUs', data)

module.exports = contactUs