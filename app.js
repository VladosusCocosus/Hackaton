
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const Schema = mongoose.Schema

const app = express()

var postData = path.join(__dirname + '/postdb.json')

app.set('view engine', 'ejs')

const url = 'mongodb://localhost:27017';

mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology: true });

const TWOHOURS = 1000 * 60 * 60 * 2

fs.readFile('postdb.json', 'utf8', function(err, content){
    if(err) throw err;
    post = JSON.parse(content)
})

const{
    PORT = 3000,
    NODE_ENV = 'development',

    SESS_SECRET = 'ssh!quiet,it\'asecret!',
    SESS_NAME = 'sid',
    SESS_LIFETIME = TWOHOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'

app.use(session({
    name: SESS_NAME,
    saveUninitialized: false,
    secret: SESS_SECRET,
    resave: false,
    cookie:{
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    },
}));

session.status = false

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(express.static('public'));



app.get('/', function(req, res){
    const{userName, status} = req.session
    
    res.render('index', {name:userName, status:status, post})
    });

const userScheme = new Schema({
    name: String,
    email: String,
    password: String,
    tel : String,
})
const User = mongoose.model("User", userScheme);

app.post('/reg', function(req, res){
    const{name, email, tel, passwordCheck, password} = req.body
    if(password === passwordCheck){
        const User = mongoose.model("User", userScheme);

        const user = new User({
            name: name,
            email: email,
            tel: tel,
            password: password
        });
        user.save()
        res.redirect('/')
    }
})
app.post('/auth', (req,res, next) => {
    const{email, password} = req.body
        User.findOne({email:email}, function(err, acc){
            console.log(acc)
            if(acc){
                if(password == acc.password){
                req.session.userId = acc._id
                req.session.userName = acc.name
                req.session.userEmail = acc.email
                req.session.tel = acc.tel
                req.session.status = true
                res.redirect('/')
                }else{
                    res.send('err')
                }
            }
        })
})
app.get('/ads', function(req,res){    
        const{userName, status} = req.session
        res.render('ads', {name:userName, status:status, post})
})



app.get('/cab', function(req, res){
    const{userName, status,tel, userEmail} = req.session
    const{postName, comment} = req.body
    res.render('cab', {name:userName, status:status, email:userEmail, tel:tel})
});

app.post('/cab', function(req, res){
    const{postName, comment} = req.body
    const{userName, tel} = req.session
    post.push({postName:postName, comment:comment, userName:userName, tel:tel})
    fs.writeFile(postData, JSON.stringify(post), err => {
        console.log(err)
     }) 
})

app.listen(PORT)