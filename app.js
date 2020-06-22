var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() ); 
const mysql = require('mysql');
const { request } = require('http');
var Connection = require('tedious').Connection;
app.engine('html', require('ejs').renderFile);

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

var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;
//temporarily set the user to rachely so we don't have to login every single time
var user = "rachely";

//Home page route, sends the home-page.html file
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/home-page.html'));
  //__dirname is a keyword for the folder your project is located in
});

app.get('/login', function(req, res) {
  if(!(user===""))
    res.redirect("/home");
  res.sendFile(path.join(__dirname + '/log-in-page.html'));
});

app.get('/signup', function(req, res) {
  if(!(user===""))
    res.redirect("/home");
  res.sendFile(path.join(__dirname + '/sign-up-page.html'));
});

app.get('/home', function(req, res) {
  //send username to the html page so that we can do use the username to get data
  //By using render, we are using ejs, which let's us send stuff with html
  //in this case, we are passing a variable called username to the file, which we can then get
  if(user == "")
    res.redirect('/login');
  res.render(__dirname + '/landing-page.html', {username:user});
});

app.get('/profile', function(req, res) {
  if(user == "")
    res.redirect('/login');
  res.render(__dirname + '/profile-page.html', {username:user});
});

app.get('/loginfailed', function(req, res) {
  res.sendFile(path.join(__dirname + '/log-in-failed-page.html'));
});
app.get('/account', function(req,res){
  if(user === "")
    res.redirect('/login');
  res.sendFile(path.join(__dirname + '/account-page.html'));
});
app.get('/signout', function(req,res){
  user = "";
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
      user = req.body.username;
      res.redirect("/home");
    }
  });
  
  profile.addParameter('username', TYPES.VarChar, req.body.username);
  connection.execSql(profile);
});

app.post('/tryingtologin', function(req, res){
  var login = new Request(`SELECT username, password FROM dbo.account_details_table
  WHERE username = @username AND password = @password`, 
  function(err,results, fields) {  
    if (err) {  
       console.log(err);
    }
    else{
      //check if there is a result that accepted :)
      if(results==1){
        user = req.body.username;
        res.redirect('/home');
      }
      else{
        res.redirect("/loginfailed");
      }
    }
   });
  login.addParameter('username', TYPES.VarChar, req.body.username);
  login.addParameter('password', TYPES.VarChar, req.body.password);     
  connection.execSql(login);
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
  profile.addParameter('username', TYPES.VarChar, user);

  profile.on('row', function(columns) {
    var rowObject ={};
    columns.forEach(function(column) {
        rowObject[column.metadata.colName] = column.value;
    });
    profileArray.push(rowObject);

  });

  profile.on('requestCompleted', function(){
    var subjects = new Request("SELECT * FROM dbo." + user + "_subject_table",
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
  updateBio.addParameter('username', TYPES.VarChar, user);
  connection.execSql(updateBio);
});
app.post("/updateEdu", function(req,res){
  var obj = req.body;
  var updateBio = new Request("UPDATE dbo.profile_table SET eduLevel = \'" + obj.edu + "\' WHERE username = @username",
  function(err){
    console.log(err);
  }); 
  updateBio.addParameter('username', TYPES.VarChar, user);
  connection.execSql(updateBio);
});
app.post("/removeSubject", function(req,res){
  var obj = req.body;
  var subjectArray = [];
  var updateSubject = new Request("DELETE FROM dbo."+user+"_subject_table WHERE Subject = @subject",
  function(err){
    console.log(err);
  }); 
  updateSubject.addParameter('subject', TYPES.VarChar, obj.subject);

  updateSubject.on('requestCompleted', function(){
    var getTable = new Request("SELECT * FROM dbo."+user+"_subject_table",
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
  var updateSubject = new Request("INSERT INTO dbo."+user+"_subject_table (Subject, Hours) VALUES (@subject, 0.0)",
  function(err){
    console.log(err);
  }); 
  updateSubject.addParameter('subject', TYPES.VarChar, obj.subject);
  updateSubject.on('requestCompleted', function(){
    var getTable = new Request("SELECT * FROM dbo."+user+"_subject_table",
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
