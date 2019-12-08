var express = require('express')
var app = express()
var path = require('path')
var session = require('express-session')
const request = require('request')
//db connection
require('dotenv').config()
var db = require('./config/keys')
var mongoose = require('mongoose')
mongoose.connect(db.mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
var secretkey=db.secret
//models
var userRegister = require('./models/db-mongoose')
var myques = require('./models/db-ques')
var contactUs = require('./models/db-contact')
var ans = require('./models/db-answers')

var bodyParser = require('body-parser')
var validator = require('validator')
var bcrypt = require('bcryptjs')

var rateLimit = require('express-rate-limit')

var port = process.env.PORT || 3002

app.use(session({
    secret: 'hello',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static("static"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

app.set('view engine', 'hbs')

//function for authorization of user
var auth = function (req, res, next) {
    userSession = req.session;

    if (req.session.userName) {

        return next();

    } else
        res.render('404');
};
var bodydata
var verifyCaptcha = (req, res, next) => {
    bodydata = JSON.parse(req.body.display)
    
    if (!bodydata['recaptcha']) {
        return res.json({
            status: false
        });
    }
    
    const token = bodydata['recaptcha'] || req.query['recaptcha'];
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${token}&remoteip=${req.connection.remoteAddress}`;

    request(verificationUrl, (error, response, body) => {
        body = JSON.parse(body);
        
        if (body.success !== undefined && !body.success) {
            console.log(body)
            return res.json({
                status: false
            });
        }
        console.log('abcd')
        next();
    });
};

//defining global variables
var userSession
var Name
var message1
var newarr = []
var useremail

app.get('/', (req, res) => {
    res.render('index', {
        message: ""
    })
})

app.get('/verify', (req, res) => {
    bigError2 = []
    bigSuccess = []
    var lname = bodydata.email;
    var lpass = bodydata.password;
        console.log('wwwwwww1')
        userRegister.find({
            email: lname
        }, (err, user) => {
            let errors = []
            if (err) {
                throw err
            }
            console.log(user)
            if (user.length == 0) {
                errors.push({
                    text: 'Email not found!'
                })
                bigError2 = errors
                res.redirect('/index#login')
            } else {
                console.log(user[0].password)
                bcrypt.compare(lpass, user[0].password, function (err, result) {
                    if (result == false) {
                        errors.push({
                            text: 'Invalid password'
                        })
                        bigError2 = errors
                        res.redirect('/index#login')
                    } else {
                        Name = user[0].name
                        message1 = user[0].name
                        useremail = user[0].email
                        console.log("message1: " + message1)
                        req.session.userName = Name
                        res.redirect('/exam')
                    }

                })

            }
        })
    
    
})
var bigError1 = []
var bigError2 = []
var bigSuccess = []
app.post('/userSignup', (req, res) => {
    var uname1 = req.body.first_name;
    var uname2 = req.body.last_name;
    var uemail = req.body.email;
    var phone = req.body.phoneno;
    var rno = req.body.regno;
    var pass = req.body.password;
    bigError1 = []
    let errors = []
    if (phone.length != 10) {
        errors.push({
            text: "Invalid phone number"
        })
    }
    if (!validator.isEmail(uemail)) {
        errors.push({
            text: "Invalid email"
        })
    }
    if (rno.length != 9) {
        errors.push({
            text: "Invalid registration number"
        })
    }
    if (rno.length == 9) {
        var check = /^1[89][BM][A-Z]{2}[0-9]{4}$/
        if (rno.match(check)) {
            console.log('true')

        } else {
            console.log('false')
            errors.push({
                text: "Invalid registration number"
            })
        }
    }

    if (errors.length > 0) {
        bigError1 = errors
        res.redirect('/index#sign-up')
    } else {
        userRegister.findOne({
            regno: rno
        }).then((user) => {
            if (user) {
                errors.push({
                    text: 'User already exists'
                })
                bigError1 = errors
                res.redirect('/index#sign-up')
            } else {
                bcrypt.hash(pass, 10, function (err, hash) {
                    console.log(hash)
                    if (err) {
                        throw err
                    }
                    var newuser = {
                        name: uname1 + " " + uname2,
                        email: uemail,
                        phone,
                        regno: rno,
                        password: hash
                    }
                    new userRegister(newuser).save((err, user) => {
                        if (err) {
                            throw err;
                        }
                        let success = []
                        if (user) {
                            bigError1 = []
                            success.push({
                                text: 'Registered successfully! You can sign in now.'
                            })
                            bigSuccess = success
                            res.redirect('/index#login')

                        }
                    })
                })

            }
        })
    }
})


app.post('/userlogin', verifyCaptcha, (req, res) => {

    userSession = req.session
    var bodydata = JSON.parse(req.body.display)
    res.redirect('/verify')

})

var mymsg = undefined
app.post('/contact', (req, res) => {
    console.log(message1)
    console.log(useremail)
    const newmsg = {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        date: new Date
    }

    new contactUs(newmsg).save((err, data) => {
        if (err) {
            throw err
        }
        console.log('message sent')
        mymsg = 'Thanks for contacting!!'
        res.redirect('/index#contact')

    })

})
app.get('/index', function (req, res) {
    res.render('index', {

        errors1: bigError1,
        errors2: bigError2,
        success: bigSuccess,
        msgsent: mymsg
    })
})

app.get('/exam', auth, function (req, res) {
    res.render('exam', {

        msg: message1
    })
})
app.get('/tech', auth, function (req, res) {
    res.render('tech', {

        msg: message1
    })
})
app.get('/manage', auth, function (req, res) {
    res.render('manag', {

        msg: message1
    })
})

var message2 = ""

app.get('/addQues', function (req, res) {
    res.render('add-ques', {
        msg: 'Admin',
        msg2: message2
    })
})

app.get('/viewSub', function (req, res) {
    res.render('view-sub', {
        msg: 'Admin',
    })

})

app.get('/admin', function (req, res) {
    message2 = ""
    res.render('admin', {
        msg: 'Admin',
    })

})

app.get('/logout', auth, function (req, res) {
    userSession = req.session;
    Name = undefined
    req.session.destroy(function (err) {
        if (err) {
            throw err;
        } else {
            console.log("Session is destroyed, You are redirected to the login page.");
            res.render('index', {
                layout: false,
                message: " "
            })
        }
    })
})

app.get('/adminlogout', function (req, res) {

    res.render('index', {
        message: " "
    })

})

app.post('/storeResponse', (req, res) => {

    var data = JSON.parse(req.body.display)

    var i
    var arr = []
    for (i = 0; i < data.response.length; i++) {
        var obj = {
            ques: data.response[i].ques,
            answer: data.response[i].answer
        }
        arr.push(obj)
    }
    var newobj = {
        name: message1,
        email: useremail,
        domain: data.domain,
        title: data.title,
        response: arr
    }

    var resp = new ans(newobj)
    resp.save(() => {
        console.log('response added')
    })
    res.redirect('/exam')
})

app.post('/addq', (req, res) => {
    var data = JSON.parse(req.body.display)
    var newobj = {
        domain: data.domain,
        title: data.title,
        ques: data.ques
    }
    console.log(data)
    var newques = new myques(newobj)
    newques.save(() => {
        console.log(newques)
    })
    message2 = "Question Added Successfully"
    res.redirect('/addQues')
})

app.post('/submissions', (req, res) => {
    var data = JSON.parse(req.body.display)
    console.log(data)
    ans.find({
        domain: data.domain,
        title: data.title
    }, (err, responses) => {
        if (err) {
            throw err
        }
        newarr = responses
        res.redirect('/success')
    })

})

app.get('/success', (req, res) => {
    console.log(newarr)
    res.render('response', {
        arr: newarr,
        msg: 'Admin'
    })

})

// app.get('/complete', (req, res) => {

//     res.render('complete')

// })


app.get('/webexam', function (err, res) {

    ans.find({
        email: useremail,
        domain: 'Technical'
    }, (err, manyuser) => {
        if (err) {
            throw err
        }

        if (manyuser.length == 2) {
            let errors = []
            errors.push({
                text: 'You cannot attempt more than 2 subdomains in technical domain!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {
            ans.findOne({
                email: useremail,
                title: 'Frontend Web Development'
            }, (err, user) => {
                let errors = []

                if (user) {
                    errors.push({
                        text: 'You have already attempted this test!'
                    })
                    res.render('exam', {
                        msg: message1,
                        errors: errors
                    })
                } else {
                    myques.find({
                        title: 'Frontend Web Development'
                    }, (err, userTest) => {
                        if (userTest.length == 0 || userTest.length!=18) {
                            res.render('no_ques', {
                                noques: 'Questions are yet to be added'
                            })
                        } else {
                            var n = userTest.length
                            var arr = []
                            var store=[]
                            l = []
                            ctr = 0
                            while (ctr != 10) {
                                x = Math.floor(Math.random() * n)
                                if (l.includes(x) == false) {
                                    l.push(x)
                                    ctr = ctr + 1
                                }
                            }

                            for (i = 0; i < 10; i++) {
                                if(userTest[l[i]].ques.includes("$"))
                            {
                                var str=userTest[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest[l[i]].ques
                                arr.push(value)
                            }
                            }

                            res.render('mcq', {
                                title: 'Frontend Web Development',
                                dom: 'Technical',
                                ques: arr,
                                mques:store,
                                name: message1

                            })

                        }


                    })
                }
            })

        }
    })

})

app.get('/webexambackend', function (err, res) {

    ans.find({
        email: useremail,
        domain: 'Technical'
    }, (err, manyuser) => {
        if (err) {
            throw err
        }

        if (manyuser.length == 2) {
            let errors = []
            errors.push({
                text: 'You cannot attempt more than 2 subdomains in technical domain!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {
            ans.findOne({
                email: useremail,
                title: 'Backend Web Development'
            }, (err, user) => {
                let errors = []

                if (user) {
                    errors.push({
                        text: 'You have already attempted this test!'
                    })
                    res.render('exam', {
                        msg: message1,
                        errors: errors
                    })
                } else {
                    myques.find({
                        title: 'Backend Web Development'
                    }, (err, userTest) => {
                        if (userTest.length == 0 || userTest.length!=13) {
                            res.render('no_ques', {
                                noques: 'Questions are yet to be added'
                            })
                        } else {
                            var n = userTest.length
                            var store=[]
                            var arr = []
                            l = []
                            ctr = 0
                            while (ctr != 10) {
                                x = Math.floor(Math.random() * n)
                                if (l.includes(x) == false) {
                                    l.push(x)
                                    ctr = ctr + 1
                                }
                            }

                            for (i = 0; i < 10; i++) {
                            if(userTest[l[i]].ques.includes("$"))
                            {
                                var str=userTest[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest[l[i]].ques
                                arr.push(value)
                            }
                            }

                            res.render('mcq', {
                                title: 'Backend Web Development',
                                dom: 'Technical',
                                ques: arr,
                                mques:store,
                                name: message1

                            })

                        }


                    })
                }
            })

        }
    })

})

app.get('/comcodexam', auth, function (err, res) {

    ans.find({
        email: useremail,
        domain: 'Technical'
    }, (err, manyuser) => {
        if (err) {
            throw err
        }

        if (manyuser.length == 2) {
            let errors = []
            errors.push({
                text: 'You cannot attempt more than 2 subdomains in technical domain!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {
            ans.findOne({
                email: useremail,
                title: 'Competitive Coding'
            }, (err, user) => {
                let errors = []
                if (user) {
                    errors.push({
                        text: 'You have already attempted this test!'
                    })
                    res.render('exam', {
                        msg: message1,
                        errors: errors
                    })
                } else {
                    myques.find({
                        title: 'Competitive Coding'
                    }, (err, userTest) => {
                        if (userTest.length == 0 || userTest.length!=10) {
                            res.render('no_ques', {
                                noques: 'Questions are yet to be added'
                            })
                        } else {

                            var n = userTest.length
                            var arr = []
                            var store=[]
                            //var store9=[]
                            l = []
                            ctr = 0
                            while (ctr != 10) {
                                x = Math.floor(Math.random() * n)
                                if (l.includes(x) == false) {
                                    l.push(x)
                                    ctr = ctr + 1
                                }
                            }

                            for (i = 0; i < 10; i++) {
                                if(userTest[l[i]].ques.includes("$"))
                            {
                                var str=userTest[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest[l[i]].ques
                                arr.push(value)
                            }
                                
                            }

                            res.render('mcq', {
                                title: 'Competitive Coding',
                                dom: 'Technical',
                                ques: arr,
                                mques:store,
                                name: message1

                            })
                        }

                    })
                }
            })

        }
    })
})


app.get('/mlaiexam', auth, function (err, res) {

    ans.find({
        email: useremail,
        domain: 'Technical'
    }, (err, manyuser) => {
        if (err) {
            throw err
        }

        if (manyuser.length == 2) {
            let errors = []
            errors.push({
                text: 'You cannot attempt more than 2 subdomains in technical domain!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {
            ans.findOne({
                email: useremail,
                title: 'Machine Learning & Artificial Intelligence'
            }, (err, user) => {
                let errors = []
                if (user) {
                    errors.push({
                        text: 'You have already attempted this test!'
                    })
                    res.render('exam', {
                        msg: message1,
                        errors: errors
                    })
                } else {
                    myques.find({
                        title: 'Machine Learning & Artificial Intelligence'
                    }, (err, userTest1) => {
                        if (userTest1.length == 0 || userTest1.length!=13) {
                            res.render('no_ques', {
                                noques: 'Questions are yet to be added'
                            })
                        } else {
                            var n = userTest1.length
                            var arr = []
                            var store=[]
                            l = []
                            ctr1 = 0
                            while (ctr1 != 10) {
                                x = Math.floor(Math.random() * n)
                                if (l.includes(x) == false) {
                                    l.push(x)
                                    ctr1 = ctr1 + 1
                                }
                            }

                            for (i = 0; i < 10; i++) {
                                if(userTest1[l[i]].ques.includes("$"))
                            {
                                var str=userTest1[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest1[l[i]].ques
                                arr.push(value)
                            }
                            }

                            res.render('mcq', {
                                title: 'Machine Learning & Artificial Intelligence',
                                dom: 'Technical',
                                ques: arr,
                                mques:store,
                                name: message1

                            })
                        }
                    })
                }
            })
        }
    })
})

app.get('/appexam', auth, function (err, res) {

    ans.find({
        email: useremail,
        domain: 'Technical'
    }, (err, manyuser) => {
        if (err) {
            throw err
        }

        if (manyuser.length == 2) {
            let errors = []
            errors.push({
                text: 'You cannot attempt more than 2 subdomains in technical domain!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {
            ans.findOne({
                email: useremail,
                title: 'App Development'
            }, (err, user) => {
                let errors = []
                if (user) {
                    errors.push({
                        text: 'You have already attempted this test!'
                    })
                    res.render('exam', {
                        msg: message1,
                        errors: errors
                    })
                } else {
                    myques.find({
                        title: 'App Development'
                    }, (err, userTest1) => {
                        if (userTest1.length == 0 || userTest1.length!=12) {
                            res.render('no_ques', {
                                noques: 'Questions are yet to be added'
                            })
                        } else {
                            var n = userTest1.length
                            var arr = []
                            var store=[]
                            l = []
                            ctr1 = 0
                            while (ctr1 != 10) {
                                x = Math.floor(Math.random() * n)
                                if (l.includes(x) == false) {
                                    l.push(x)
                                    ctr1 = ctr1 + 1
                                }
                            }
                            for (i = 0; i < 10; i++) {
                                if(userTest1[l[i]].ques.includes("$"))
                            {
                                var str=userTest1[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest1[l[i]].ques
                                arr.push(value)
                            }
                            }

                            res.render('mcq', {
                                title: 'App Development',
                                dom: 'Technical',
                                ques: arr,
                                mques:store,
                                name: message1

                            })
                        }
                    })
                }

            })
        }
    })
})

app.get('/opexam', auth, function (err, res) {

    ans.findOne({
        email: useremail,
        title: 'Operations'
    }, (err, user) => {
        let errors = []
        if (user) {
            errors.push({
                text: 'You have already attempted this test!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {

            myques.find({
                title: 'Operations'
            }, (err, userTest) => {
                if (userTest.length == 0 || userTest.length!=8) {
                    res.render('no_ques', {
                        noques: 'Questions are yet to be added'
                    })
                } else {
                    var n = userTest.length
                    var arr = []
                    var store=[]
                    l = []
                    ctr = 0
                    while (ctr != 8) {
                        x = Math.floor(Math.random() * n)
                        if (l.includes(x) == false) {
                            l.push(x)
                            ctr = ctr + 1
                        }
                    }

                    for (i = 0; i < 8; i++) {
                        if(userTest[l[i]].ques.includes("$"))
                            {
                                var str=userTest[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest[l[i]].ques
                                arr.push(value)
                            }
                    }

                    res.render('mcq', {
                        title: 'Operations',
                        dom: 'Management',
                        ques: arr,
                        mques:store,
                        name: message1

                    })
                }
            })
        }
    })
})

app.get('/sponsexam', auth, function (err, res) {

    ans.findOne({
        email: useremail,
        title: 'Sponsorship'
    }, (err, user) => {
        let errors = []
        if (user) {
            errors.push({
                text: 'You have already attempted this test!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {

            myques.find({
                title: 'Sponsorship'
            }, (err, userTest) => {
                if (userTest.length == 0 || userTest.length!=5) {
                    res.render('no_ques', {
                        noques: 'Questions are yet to be added'
                    })
                } else {
                    var n = userTest.length
                    var arr = []
                    l = []
                    var store=[]
                    ctr = 0
                    while (ctr != 5) {
                        x = Math.floor(Math.random() * n)
                        if (l.includes(x) == false) {
                            l.push(x)
                            ctr = ctr + 1
                        }
                    }

                    for (i = 0; i < 5; i++) {
                        if(userTest[l[i]].ques.includes("$"))
                            {
                                var str=userTest[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest[l[i]].ques
                                arr.push(value)
                            }
                    }

                    res.render('mcq', {
                        title: 'Sponsorship',
                        dom: 'Management',
                        ques: arr,
                        mques:store,
                        name: message1

                    })
                }
            })
        }
    })
})

app.get('/cwexam', auth, function (err, res) {

    ans.findOne({
        email: useremail,
        title: 'Content Writing'
    }, (err, user) => {
        let errors = []
        if (user) {
            errors.push({
                text: 'You have already attempted this test!'
            })
            res.render('exam', {
                msg: message1,
                errors: errors
            })
        } else {
            myques.find({
                title: 'Content Writing'
            }, (err, userTest) => {
                if (userTest.length == 0 || userTest.length!=9) {
                    res.render('no_ques', {
                        noques: 'Questions are yet to be added'
                    })
                } else {
                    var n = userTest.length
                    var arr =[]
                    var store=[]
                    l = []
                    ctr = 0
                    while (ctr != 9) {
                        x = Math.floor(Math.random() * n)
                        if (l.includes(x) == false) {
                            l.push(x)
                            ctr = ctr + 1
                        }
                    }

                    for (i = 0; i < 9; i++) {
                        if(userTest[l[i]].ques.includes("$"))
                            {
                                var str=userTest[l[i]].ques
                                var s=str.split("$")
                                store.push({data:s})

                            }
                            else{
                                var value = userTest[l[i]].ques
                                arr.push(value)
                            }
                    }

                    res.render('mcq', {
                        title: 'Content Writing',
                        dom: 'Management',
                        ques: arr,
                        mques:store,
                        name: message1

                    })
                }
            })
        }
    })

})

// Error Messages

app.get(function (req, res) {
    res.status(404).render('404');
});

app.use(function (req, res) {
    res.status(500).render('404');
});

app.get(function (req, res) {
    res.status(400).render('404');
});

app.use(function (req, res) {
    res.status(400).render('404');
});

app.get(function (req, res) {
    res.status(403).render('404');
});

app.use(function (req, res) {
    res.status(403).render('404');
});

app.get(function (req, res) {
    res.status(502).render('404');
});

app.use(function (req, res) {
    res.status(502).render('404');
});

app.get(function (req, res) {
    res.status(503).render('404');
});

app.use(function (req, res) {
    res.status(503).render('404');
});

app.get(function (req, res) {
    res.status(504).render('404');
});

app.use(function (req, res) {
    res.status(504).render('404');
});

app.listen(port, () => {
    console.log('Server is running on http://localhost:3002')
})