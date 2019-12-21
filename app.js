const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const app = express()


app.set('view engine', 'ejs')

const url = 'mongodb://localhost:27017';

mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology: true });

const TWOHOURS = 1000 * 60 * 60 * 2

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

app.use('/static', express.static('public'))

app.get('/', function(req, res){
    const{userName, status} = req.session
    res.render('index', {name:userName, status:status})
});
app.get('/auth', function(req,res){
    res.render('auth_panel')
})
app.get('/reg', function(req,res){
   res.render('reg_panel') 
})

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
                req.session.status = true
                res.redirect('/')
                }else{
                    
                }
            }
        })
})
app.listen(PORT)