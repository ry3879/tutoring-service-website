var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() ); 
const mysql = require('mysql');
const { request } = require('http');
const passport = require('passport');
const flash = require('connect-flash');

app.engine('html', require('ejs').renderFile);
const session = require('express-session');
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');

//Passport config
require('./config/passport')(passport);

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash, which allows us to pass messages between sites
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//Home page route, sends the home-page.html file
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/home-page.html'));
  //__dirname is a keyword for the folder your project is located in
});

app.get('/login', forwardAuthenticated, function(req, res) {
  res.render(path.join(__dirname + '/log-in-page.html'));
});

app.get('/signup', forwardAuthenticated, function(req, res) {
  res.render(path.join(__dirname + '/sign-up-page.html'));
});

app.get('/home', ensureAuthenticated, function(req, res) {
  //send username to the html page
  //By using render, we are using ejs, which let's us send stuff with html
  //in this case, we are passing a variable called username to the file, which we can then get
  res.render(__dirname + '/landing-page.html', {username:req.user.username});
});

app.get('/profile', ensureAuthenticated, function(req, res) {
  res.render(__dirname + '/profile-page.html', {username:req.user.username});
});

app.get('/loginfailed', forwardAuthenticated, function(req, res) {
  res.sendFile(path.join(__dirname + '/log-in-failed-page.html'));
});
app.get('/account', ensureAuthenticated, function(req,res){
  res.sendFile(path.join(__dirname + '/account-page.html'));
});
app.get('/signout', function(req,res){
  req.logout();
  req.flash('success_msg', 'You successfully logged out');
  res.redirect("/login");
});


//All image files will go under public/images
app.use(express.static('public'));

//all other routes
app.use('/profile', require('./routes/profile.js'));
app.use('/users', require('./routes/users.js'));
app.use('/learn', require('./routes/learn.js'));

//set the port to 3000
var port = "3000";
app.set('port', port);
module.exports = app;
