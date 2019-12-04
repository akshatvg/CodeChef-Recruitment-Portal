var mongoose=require('mongoose')

//mongoose.connect('mongodb://localhost:27017/ques',{useNewUrlParser:true})

var data= new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    domain:{
        type:String
    },
    title:{
        type:String
    },
    response:[{
        ques:{
            type:String,
            required:true
        },
        answer:{
            type:String,
            default:'No Response'
        }
    }]
    
})
var ans=mongoose.model('ans',data)
module.exports=ans
// var disp=ans({
//     name:'ghjh',
//     response:[{ques:'sdhsd',answer:'sfsfs'},{ques:'fdf'}]
// })
// disp.save()
// console.log(disp)
// ans.find({domain:'Technical',title:'Web Development'},(err,resp)=>{
//     console.log(resp)
// })


