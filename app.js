var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() ); 
const mysql = require('mysql');
const { request } = require('http');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
const passport = require('passport');
var TYPES = require('tedious').TYPES;
app.engine('html', require('ejs').renderFile);
const session = require('express-session');
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');

//Passport config
require('./config/passport')(passport);

//connect to the database
var config = {  
    server: 'tutoringservice.database.windows.net',
    authentication: {
        type: 'default',
        options: {
            userName: 'schladies', 
            password: 'nohotwater3@'  
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'EduDatabase',
        rowCollectionOnRequestCompletion: true
    }
};  
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    console.log("Connected");  
});

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

//temporarily set the user to rachely so we don't have to login every single time
//Home page route, sends the home-page.html file
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/home-page.html'));
  //__dirname is a keyword for the folder your project is located in
});

app.get('/login', forwardAuthenticated, function(req, res) {
  res.sendFile(path.join(__dirname + '/log-in-page.html'));
});

app.get('/signup', forwardAuthenticated, function(req, res) {
  res.sendFile(path.join(__dirname + '/sign-up-page.html'));
});

app.get('/home', ensureAuthenticated, function(req, res) {
  //console.log(req);
  console.log(req.userusername);
  //send username to the html page so that we can do use the username to get data
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
  res.redirect("/login");
});

app.post('/tryingtosignup', function(req, res){
  var request1 = new Request(`INSERT INTO dbo.account_details_table (username, password, fname, lname, minitial, address, city, country, email, birthday) 
  VALUES (@username, @password, @fname, @lname, @minitial, @address, @city, @country, @email, @birthday)`, 
  function(err) {  
    if (err) {  
       console.log(err);
    } 
   });
  
  request1.addParameter('username', TYPES.VarChar, req.body.username);  
  request1.addParameter('password', TYPES.VarChar, req.body.password);  
  request1.addParameter('fname', TYPES.VarChar, req.body.fname);  
  request1.addParameter('lname', TYPES.VarChar, req.body.lname);
  request1.addParameter('minitial', TYPES.NChar, req.body.minitial);
  request1.addParameter('address', TYPES.VarChar, req.body.address);
  request1.addParameter('city', TYPES.VarChar, req.body.city);
  request1.addParameter('country', TYPES.VarChar, req.body.country);
  request1.addParameter('email', TYPES.VarChar, req.body.email);
  request1.addParameter('birthday', TYPES.Date, req.body.birthday);        
  connection.execSql(request1);
  var profile = new Request(`INSERT INTO dbo.profile_table (username) VALUES (@username)`, 
  function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/login");
    }
  });
  
  profile.addParameter('username', TYPES.VarChar, req.body.username);
  connection.execSql(profile);
});

app.post('/tryingtologin', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/loginfailed'
  })(req, res, next);
});

app.get('/getprofile', function(req,res){
  var profileArray = [];
  var subjectArray = [];
  var profile = new Request(`SELECT bio, eduLevel FROM dbo.profile_table WHERE username = @username`,
  function(err, rowCount, rows){
    if(err){
      console.log(err);
    }
    
  });
  profile.addParameter('username', TYPES.VarChar, req.user.username);

  profile.on('row', function(columns) {
    var rowObject ={};
    columns.forEach(function(column) {
        rowObject[column.metadata.colName] = column.value;
    });
    profileArray.push(rowObject);

  });

  profile.on('requestCompleted', function(){
    var subjects = new Request("SELECT * FROM dbo." + req.user.username + "_subject_table",
      function(err, rowCount, rows){
        if(err){
          console.log(err);
        }
    });
    subjects.on('row', function(columns) {
      var rowObject ={};
      columns.forEach(function(column) {
          rowObject[column.metadata.colName] = column.value;
      });
      subjectArray.push(rowObject);
  
    });
    subjects.on('requestCompleted', function(){
      res.json({status:200, profile:profileArray, table:subjectArray, message:"success"});
    });
    connection.execSql(subjects);

  });
  connection.execSql(profile);
});

app.post("/updateBio", function(req,res){
  var obj = req.body;
  var updateBio = new Request("UPDATE dbo.profile_table SET bio = \'" + obj.bio + "\' WHERE username = @username",
  function(err){
    console.log(err);
  }); 
  updateBio.addParameter('username', TYPES.VarChar, req.user.username);
  connection.execSql(updateBio);
});
app.post("/updateEdu", function(req,res){
  var obj = req.body;
  var updateBio = new Request("UPDATE dbo.profile_table SET eduLevel = \'" + obj.edu + "\' WHERE username = @username",
  function(err){
    console.log(err);
  }); 
  updateBio.addParameter('username', TYPES.VarChar, req.user.username);
  connection.execSql(updateBio);
});
app.post("/removeSubject", function(req,res){
  var obj = req.body;
  var subjectArray = [];
  var updateSubject = new Request("DELETE FROM dbo."+req.user.username+"_subject_table WHERE Subject = @subject",
  function(err){
    console.log(err);
  }); 
  updateSubject.addParameter('subject', TYPES.VarChar, obj.subject);

  updateSubject.on('requestCompleted', function(){
    var getTable = new Request("SELECT * FROM dbo."+req.user.username+"_subject_table",
    function(err){
      console.log(err);
    });
    getTable.on('row', function(columns) {
      var rowObject ={};
      columns.forEach(function(column) {
          rowObject[column.metadata.colName] = column.value;
      });
      subjectArray.push(rowObject);
    });
    getTable.on('requestCompleted', function(){
      res.json({status:200, table:subjectArray, message:"success"});
    });
    connection.execSql(getTable);
  });
  connection.execSql(updateSubject);
});
app.post("/addSubject", function(req,res){
  var obj = req.body;
  var subjectArray = [];
  var updateSubject = new Request("INSERT INTO dbo."+req.user.username+"_subject_table (Subject, Hours) VALUES (@subject, 0.0)",
  function(err){
    console.log(err);
  }); 
  updateSubject.addParameter('subject', TYPES.VarChar, obj.subject);
  updateSubject.on('requestCompleted', function(){
    var getTable = new Request("SELECT * FROM dbo."+req.user.username+"_subject_table",
    function(err){
      console.log(err);
    });
    getTable.on('row', function(columns) {
      var rowObject ={};
      columns.forEach(function(column) {
          rowObject[column.metadata.colName] = column.value;
      });
      subjectArray.push(rowObject);
    });
    getTable.on('requestCompleted', function(){
      res.json({status:200, table:subjectArray, message:"success"});
    });
    connection.execSql(getTable);
  });
  connection.execSql(updateSubject);
});


//All image files will go under public/images
app.use(express.static('public'));

//set the port to 3000
var port = "3000";
app.set('port', port);
module.exports = app;
