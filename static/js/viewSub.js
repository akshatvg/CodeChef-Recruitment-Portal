var domain=document.querySelector('.selectpick')
var btnSubmit=document.querySelector('.btnSubmit')
var ques=document.querySelector('.ques')
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

        var data={domain:domain.value,title:title.value}

        $.ajax({
            url:'/submissions',
            type:"POST",
            data:{display:JSON.stringify(data)},
            success:function(data){
                console.log('success')
                window.location.href='/success'
            },
            error:function(err)
            {
                console.log('error')
            }
            
        })
})
