var btnSubmit = document.querySelector('.btnSubmit')
var dom = document.querySelector('.dom')
var domTitle = document.querySelector('.dom-title')
var resp1 = document.querySelectorAll('.sub')
var ques1 = document.querySelectorAll('.ques1')
var ju=document.querySelectorAll('.ju')
var arr = []
var aar1=[]
var j;

for(j=0;j<ques1.length;j++)
{
    aar1.push(ques1[j].innerHTML)
}
for(j=0;j<ju.length;j++)
{
    aar1.push(ju[j].innerHTML)
}

//onsole.log(ques1[1].innerHTML.data)
console.log(aar1.length)
console.log(resp1.length)
$('.btnSubmit').on('click', () => {

    var i
    for (i = 0; i < aar1.length; i++) {
    
                    var newobj = {
                    ques: aar1[i],
                    answer: resp1[i].value
    
                     } 
        
        arr.push(newobj)
    }
    //console.log(arr)
    var data = {
        domain: dom.innerHTML,
        title: domTitle.innerHTML,
        response: arr
    }
    //console.log(JSON.stringify(data))
    $.ajax({
        url: '/storeResponse',
        type: "POST",
        // data:{disp:JSON.stringify(data)},
        data: {
            display: JSON.stringify(data)
        },
        success: function (data) {
            console.log('success')
            // window.location.href = '/exam'
        },
        error: function (err) {
            console.log('error')
        }

    })
})