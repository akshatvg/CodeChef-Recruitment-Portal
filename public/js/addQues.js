var domain=document.querySelector('.selectpick')
var btnSubmit=document.querySelector('.btnSubmit')
var ques=document.querySelector('.ques')
var msg=document.querySelector('.msg')
var title

btnSubmit.addEventListener('click',()=>{
    if(domain.value=="Technical")
    {
        title=document.querySelectorAll('.selectpick2')[0]
    }
    else if(domain.value=="Management")
    {
        title=document.querySelectorAll('.selectpick2')[1]
    }
    else{
        title=document.querySelectorAll('.selectpick2')[2]
    }

        var data={domain:domain.value,title:title.value,ques:ques.value}

        $.ajax({
            url:'/addq',
            type:"POST",
            data:{display:JSON.stringify(data)},
            success:function(data){
                console.log('success')
                window.location.href='/addQues'
            },
            error:function(err)
            {
                console.log('error')
            }
            
        })
})
