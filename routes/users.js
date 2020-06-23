var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const passport = require('passport');

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

router.post('/signup', function(req, res){
  bcrypt.hash(req.body.password, 10, function (err, hash){
    var request1 = new Request(`INSERT INTO dbo.account_details_table (username, password, fname, lname, minitial, address, city, country, email, birthday) 
  VALUES (@username, @password, @fname, @lname, @minitial, @address, @city, @country, @email, @birthday)`, 
  function(err) {  
    if (err) {  
       console.log(err);
    } 
   });
  
  request1.addParameter('username', TYPES.VarChar, req.body.username);  
  request1.addParameter('password', TYPES.VarChar, hash);  
  request1.addParameter('fname', TYPES.VarChar, req.body.fname);  
  request1.addParameter('lname', TYPES.VarChar, req.body.lname);
  request1.addParameter('minitial', TYPES.NChar, req.body.minitial);
  request1.addParameter('address', TYPES.VarChar, req.body.address);
  request1.addParameter('city', TYPES.VarChar, req.body.city);
  request1.addParameter('country', TYPES.VarChar, req.body.country);
  request1.addParameter('email', TYPES.VarChar, req.body.email);
  request1.addParameter('birthday', TYPES.Date, req.body.birthday);        
  
  request1.on('requestCompleted', function(){
    var profile = new Request(`INSERT INTO dbo.profile_table (username) VALUES (@username)`, 
    function(err){
      if(err){
        console.log(err);
      }
    });
    profile.addParameter('username', TYPES.VarChar, req.body.username);
    profile.on('requestCompleted', function(){
      var subject = new Request(`CREATE TABLE dbo.`+req.body.username + `_subject_table (Subject VARCHAR(50) NOT NULL PRIMARY KEY, Rating DECIMAL(2,1), Hours DECIMAL(4,1) NOT NULL)`, 
      function(err){
        if(err){
          console.log(err);
        }
      });
      subject.on('requestCompleted', function(){
        req.flash('success_msg', 'You have now been signed up and can log in.');
        res.redirect('/login');
      });
      connection.execSql(subject);
    });
    connection.execSql(profile);
  });
  
  
  connection.execSql(request1);
  });
});

router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

module.exports = router;
