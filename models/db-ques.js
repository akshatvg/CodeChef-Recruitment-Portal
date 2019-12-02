var mongoose=require('mongoose')
//var validator=require('validator')

mongoose.connect('mongodb://localhost:27017/ques',{useNewUrlParser:true})

var ques=new mongoose.Schema({
    ques:{
        type:String,
        required:true
    },
    domain:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    }
})

var myques=mongoose.model('myques',ques)
// var appq=mongoose.model('appq',ques)
// var iosq=mongoose.model('iosq',ques)
// var blockchainq=mongoose.model('blockchainq',ques)
// var designq=mongoose.model('designq',ques)
// var mlq=mongoose.model('mlaiq',ques)
// var aiq=mongoose.model('aiq',ques)
// var comcodq= mongoose.model('comcodq',ques)
// var vrq=mongoose.model('vrq',ques)
// var contentq=mongoose.model('contentq',ques)
// var manageq=mongoose.model('manageq',ques)
// var sponsq=mongoose.model('sponsq',ques)

module.exports=myques
// var x=new qss({
//     ques:"jfdjfdf",
//     domain:"dffs",
//     title:"fhfhe"
// })
// x.save()
// console.log(x)



