
var mongoose=require('mongoose')
mongoose.connect(process.env.MONGO_DB,{useNewUrlParser:true})