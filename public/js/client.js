var btnSubmit=document.querySelector('.btnSubmit')
var dom=document.querySelector('.dom')
var domTitle=document.querySelector('.dom-title')
var resp1=document.querySelectorAll('.sub')
var ques1=document.querySelectorAll('.ques')
var arr=[]
$('.btnSubmit').on('click',()=>{

    var i
    for(i=0;i<ques1.length;i++)
    {
        var newobj={
            ques:ques1[i].innerHTML,
            answer:resp1[i].value
            
        }
        arr.push(newobj)
    }
    //console.log(arr)
     var data={domain:dom.innerHTML,title:domTitle.innerHTML,response:arr}
    //console.log(JSON.stringify(data))
    $.ajax({
        url:'/storeResponse',
        type:"POST",
        // data:{disp:JSON.stringify(data)},
        data:{display:JSON.stringify(data)},
        success:function(data){
            console.log('success')
            window.location.href='/complete'
        },
        error:function(err)
        {
            console.log('error')
        }
        
    })
})