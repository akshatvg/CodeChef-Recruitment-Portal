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
    message: {
        type: String
    },
    date: {
        type: Date
    }
})

var contactUs = mongoose.model('contactUs', data)

module.exports = contactUs