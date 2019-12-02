var mongoose=require('mongoose')
var validator=require('validator')

mongoose.connect('mongodb://localhost:27017/record',{useNewUrlParser:true})

var users=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        validate(user)
        {
            if(!validator.isEmail(user))
            {
                alert('invalid email syntax')
                location.href='/signup'
            }
        }
    },
    phone:{
        type:Number,
        required:true,
        maxlength:10
    },
    regno:{
        type:String,
        required:true,
        maxlength:9
    },
    password:{
        type:String,
        required:true
    }
})

var userRegister=mongoose.model('userRegister',users)

module.exports=userRegister