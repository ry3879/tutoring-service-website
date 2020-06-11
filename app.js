var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() ); 
const mysql = require('mysql');
var Connection = require('tedious').Connection;

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
        database: 'EduDatabase'
    }
};  
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    console.log("Connected");  
});

var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES; 

//Home page route, sends the home-page.html file
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/home-page.html'));
  //__dirname is a keyword for the folder your project is located in
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname + '/log-in-page.html'));
});

app.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname + '/sign-up-page.html'));
});
app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname + '/landing-page.html'));
});

app.post('/tryingtosignup', function(req, res){
  request = new Request(`INSERT INTO dbo.account_details_table (username, password, fname, lname, minitial, address, city, country, email, birthday) 
  VALUES (@username, @password, @fname, @lname, @minitial, @address, @city, @country, @email, @birthday)`, 
  function(err) {  
    if (err) {  
       console.log(err);
       res.write("Sign Up Failed! :(");
       res.end();}  
   });
  
  request.addParameter('username', TYPES.VarChar, req.body.username);  
  request.addParameter('password', TYPES.VarChar, req.body.password);  
  request.addParameter('fname', TYPES.VarChar, req.body.fname);  
  request.addParameter('lname', TYPES.VarChar, req.body.lname);
  request.addParameter('minitial', TYPES.NChar, req.body.minitial);
  request.addParameter('address', TYPES.VarChar, req.body.address);
  request.addParameter('city', TYPES.VarChar, req.body.city);
  request.addParameter('country', TYPES.VarChar, req.body.country);
  request.addParameter('email', TYPES.VarChar, req.body.email);
  request.addParameter('birthday', TYPES.Date, req.body.birthday);  
  request.on('row', function(columns) {  
    columns.forEach(function(column) {  
      if (column.value === null) {  
        console.log('NULL');  
      } else {  
        console.log("id of inserted item is " + column.value);  
      }  
    });  
  });       
  connection.execSql(request);
  res.write("Sign Up Successful! :)");
  res.end();
  
});

app.post('/tryingtologin', function(req, res){
  res.write("Logging in ...");
  request = new Request(`SELECT username, password FROM dbo.account_details_table
  WHERE username = @username AND password = @password`, 
  function(err,results, fields) {  
    if (err) {  
       console.log(err);}
    else{
      //check if there is a result that accepted :)
      if(results==1)
        res.write("Log in successful!");
      else
        res.write("Log in Failed");
    }
    res.end();
   });
  request.addParameter('username', TYPES.VarChar, req.body.username);
  request.addParameter('password', TYPES.VarChar, req.body.password);     
  connection.execSql(request);
});

//All image files will go under public/images
app.use(express.static('public'));

//set the port to 3000
var port = "3000";
app.set('port', port);
module.exports = app;
