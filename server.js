let express = require('express');
let mongoose = require('mongoose');
let passport = require('passport');
let localStrategy = require('passport-local');
var path = require('path');
let methodOverride = require('method-override');
let session = require('express-session');
let flash = require('connect-flash');
let User = require('./models/user_DB')
let app =  express();
require('dotenv').config();



const DB_USERNAME = process.env.DB_USERNAME,
	DB_USERPASS = process.env.DB_USERPASS;

mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_USERPASS}@cluster0.lznuwtb.mongodb.net/?retryWrites=true&w=majority`)
.then(()=>{
    console.log('db connected');
}).catch(()=>{
     console.log('errorr');
     console.error();
});

const SESSION_PASS = process.env.SESSION_PASS;
app.use(
    session({
        secret: SESSION_PASS,
        resave:false,
        saveUninitialized: true,
        cookie:{
            httpOnly:true,
            maxAge:1000*60*60*24
        }
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});



let hotelsRoutes = require('./routes/hotels');
let authRoutes = require('./routes/auth');
let userRoutes = require('./routes/user');
let reviewRoutes = require('./routes/reviews')
app.use(hotelsRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(reviewRoutes);



const PORT = process.env.PORT;
app.listen(`PORT`,()=>{
    console.log('server connected to port ' + PORT);
});
