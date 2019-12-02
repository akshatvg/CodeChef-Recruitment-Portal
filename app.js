var express = require('express')
var port = process.env.PORT || 3002
var app = express()
var path = require('path')
var session = require('express-session')
var userRegister = require('./models/db-mongoose')
var myques = require('./models/db-ques')
var bodyParser = require('body-parser')
var ans = require('./models/db-answers')

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

app.set('view engine', 'hbs')

//function for authorization of user
var auth = function (req, res, next) {
    userSession = req.session;

    if (req.session.userName) {

        return next();

    } else
        return res.sendStatus(401);
};

//defining global variables
var userSession
var Name
var now
var message1
var newarr = []
var tests = []
var useremail

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + 'static/index.html'))
})

app.get('/signin', (req, res) => {
    res.render('signin', {
        message: " "
    })
})

app.get('/userSignup', (req, res) => {
    var uname1 = req.query.first_name;
    var uname2 = req.query.last_name;
    var uemail = req.query.email;
    var phone = req.query.phoneno;
    var rno = req.query.regno;
    var pass = req.query.password;

    var user = new userRegister({
        name: uname1 + " " + uname2,
        email: uemail,
        phone,
        regno: rno,
        password: pass
    })
    user.save()
    res.render('signin', {

        message: " "
    })

})

app.get('/userlogin', (req, res) => {

    userSession = req.session
    var lname = req.query.email;
    var lpass = req.query.password;
    if (lname == 'admin' && lpass == 'admin') {
        res.render('admin', {
            msg: 'Admin'
        })
    } else {
        userRegister.find({
            email: lname,
            password: lpass
        }, (err, user) => {
            if (err) {
                throw err
            }
            console.log(user)
            if (user.length == 0) {
                res.render('signin', {
                    layout: false,
                    message: "Invalid email or password "
                })
            } else {
                Name = user[0].name
                message1 = user[0].name
                useremail = user[0].email
                console.log("message1: " + message1)
                req.session.userName = Name
                res.render('index', {

                    msg: message1
                })
            }
        })
    }


})
app.get('/index', auth, function (req, res) {
    res.render('index', {

        msg: message1
    })
})

app.get('/list', auth, function (req, res) {
    res.render('list', {

        msg: message1
    })
})

app.get('/calendar', auth, function (req, res) {
    res.render('calendar', {

        msg: message1
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
    lists = []
    req.session.destroy(function (err) {
        if (err) {
            throw err;
        } else {
            console.log("Session is destroyed, You are redirected to the login page.");
            res.render('signin', {
                layout: false,
                message: " "
            })
        }
    })
})

app.get('/adminlogout', function (req, res) {

    res.render('signin', {
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
    res.redirect('/complete')
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

app.get('/complete', (req, res) => {

    tests.push(now)
    now = undefined
    res.render('complete')

})


app.get('/webexam', function (err, res) {

    var x = tests.includes('web')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'web'
        myques.find({
            title: 'Web Development'
        }, (err, userTest) => {
            var n = userTest.length
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
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Web Development',
                dom: 'Technical',
                ques: arr,
                name: message1

            })


        })

    }


})

app.get('/comcodexam', auth, function (err, res) {

    var x = tests.includes('cc')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'cc'
        myques.find({
            title: 'Competitive Coding'
        }, (err, userTest) => {
            var n = userTest.length
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
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Competitive Coding',
                dom: 'Technical',
                ques: arr,
                name: message1

            })

        })
    }
})


app.get('/mlaiexam', auth, function (err, res) {

    var x = tests.includes('mlai')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'mlai'
        myques.find({
            title: 'Machine Learning & Artificial Intelligence'
        }, (err, userTest1) => {
            var n = userTest1.length
            var arr = []
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
                var value = userTest1[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Machine Learning & Artificial Intelligence',
                dom: 'Technical',
                ques: arr,
                name: message1

            })
        })
    }
})

app.get('/appexam', auth, function (err, res) {

    var x = tests.includes('app')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'app'
        myques.find({
            title: 'App Development'
        }, (err, userTest1) => {
            var n = userTest1.length
            var arr = []
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
                var value = userTest1[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'App Development',
                dom: 'Technical',
                ques: arr,
                name: message1

            })

        })
    }

})


app.get('/blockchain', auth, function (err, res) {

    var x = tests.includes('blockchain')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'blockchain'
        myques.find({
            title: 'Blockchain'
        }, (err, userTest) => {
            var n = userTest.length
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
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Blockchain',
                dom: 'Technical',
                ques: arr,
                name: message1

            })

        })
    }
})

app.get('/vrexam', auth, function (err, res) {

    var x = tests.includes('vr')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'vr'
        myques.find({
            title: 'Augmented & Virtual Reality'
        }, (err, userTest) => {
            var n = userTest.length
            var arr = []
            l = []
            ctr = 0
            while (ctr != 5) {
                x = Math.floor(Math.random() * n)
                if (l.includes(x) == false) {
                    l.push(x)
                    ctr = ctr + 1
                }
            }

            for (i = 0; i < 5; i++) {
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Augmented & Virtual Reality',
                domain: 'Technical',
                ques: arr,
                name: message1

            })

        })
    }
})

app.get('/opexam', auth, function (err, res) {

    var x = tests.includes('op')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'op'
        myques.find({
            title: 'Operations'
        }, (err, userTest) => {
            var n = userTest.length
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
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Operations',
                dom: 'Management',
                ques: arr,
                name: message1

            })

        })
    }
})

app.get('/sponsexam', auth, function (err, res) {

    var x = tests.includes('spons')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'spons'
        myques.find({
            title: 'Sponsorship'
        }, (err, userTest) => {
            var n = userTest.length
            var arr = []
            l = []
            ctr = 0
            while (ctr != 3) {
                x = Math.floor(Math.random() * n)
                if (l.includes(x) == false) {
                    l.push(x)
                    ctr = ctr + 1
                }
            }

            for (i = 0; i < 3; i++) {
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Sponsorship',
                dom: 'Management',
                ques: arr,
                name: message1

            })

        })
    }
})

app.get('/cwexam', auth, function (err, res) {
    var x = tests.includes('cw')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'cw'
        myques.find({
            title: 'Content Writing'
        }, (err, userTest) => {
            var n = userTest.length
            var arr = []
            l = []
            ctr = 0
            while (ctr != 2) {
                x = Math.floor(Math.random() * n)
                if (l.includes(x) == false) {
                    l.push(x)
                    ctr = ctr + 1
                }
            }

            for (i = 0; i < 2; i++) {
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Content Writing',
                dom: 'Management',
                ques: arr,
                name: message1

            })

        })
    }
})

app.get('/designexam', auth, function (err, res) {

    var x = tests.includes('design')

    if (x == true) {
        res.render('index', {
            msg: message1
        })
    } else {
        now = 'design'
        myques.find({
            title: 'Design'
        }, (err, userTest) => {
            var n = userTest.length
            console.log(n)
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
                var value = userTest[l[i]].ques
                arr.push(value)
            }

            res.render('test', {
                title: 'Design',
                dom: 'Design',
                ques: arr,
                name: message1
            })

        })
    }
})

app.listen(port, () => {
    console.log('Server is running on http://localhost:3002')
})