var express = require('express');
var router = express.Router();
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const connection = require('../config/connection');

router.get('/getprofile', function(req,res){
  var profileArray = [];
  var subjectArray = [];
  var profile = new Request(`SELECT bio, eduLevel FROM dbo.profile_table WHERE username = @username`,
  function(err, rowCount, rows){
    if(err){
      console.log(err);
    }
    
  });
  profile.addParameter('username', TYPES.VarChar, req.user.username);

  //on each row, we read it in, add it to a rowObject. These row objects are stored in array.
  //This is also stored in JSON format, which we can send back to the html files and parse easily.
  //First grabbing the general profile stuff.
  profile.on('row', function(columns) {
    var rowObject ={};
    columns.forEach(function(column) {
        rowObject[column.metadata.colName] = column.value;
    });
    profileArray.push(rowObject);

  });
  //execute next request once this one is done. Trying to execute multiple requests will result in a failure
  //Cannot process more than one request, so we do this to make sure we only execute the second once the first is done.
  profile.on('requestCompleted', function(){
    var subjects = new Request("SELECT * FROM dbo." + req.user.username + "_subject_table",
      function(err, rowCount, rows){
        if(err){
          console.log(err);
        }
    });
    //Now grab the info from the subject table
    subjects.on('row', function(columns) {
      var rowObject ={};
      columns.forEach(function(column) {
          rowObject[column.metadata.colName] = column.value;
      });
      subjectArray.push(rowObject);
  
    });
    subjects.on('requestCompleted', function(){
      //send this information back to the html file in JSON format once done.
      res.json({status:200, profile:profileArray, table:subjectArray, message:"success"});
    });
    connection.execSql(subjects);

  });
  connection.execSql(profile);
});
  
//update the bio component of the profile
router.post("/updateBio", function(req,res){
  var obj = req.body;
  var updateBio = new Request("UPDATE dbo.profile_table SET bio = \'" + obj.bio + "\' WHERE username = @username",
  function(err){
    if(err)
      console.log(err);
  }); 
  updateBio.addParameter('username', TYPES.VarChar, req.user.username);
  connection.execSql(updateBio);
});
//update Education Level
router.post("/updateEdu", function(req,res){
  var obj = req.body;
  var updateBio = new Request("UPDATE dbo.profile_table SET eduLevel = \'" + obj.edu + "\' WHERE username = @username",
  function(err){
    if(err)
      console.log(err);
  }); 
  updateBio.addParameter('username', TYPES.VarChar, req.user.username);
  connection.execSql(updateBio);
});

//Remove a subject from the table
router.post("/removeSubject", function(req,res){
  var obj = req.body;
  var subjectArray = [];
  var updateSubject = new Request("DELETE FROM dbo."+req.user.username+"_subject_table WHERE Subject = @subject",
  function(err){
    if(err)
      console.log(err);
  }); 
  updateSubject.addParameter('subject', TYPES.VarChar, obj.subject);

  updateSubject.on('requestCompleted', function(){
    var getTable = new Request("SELECT * FROM dbo."+req.user.username+"_subject_table",
    function(err){
      if(err)
        console.log(err);
    });
    getTable.on('row', function(columns) {
      var rowObject ={};
      columns.forEach(function(column) {
          rowObject[column.metadata.colName] = column.value;
      });
      subjectArray.push(rowObject);
    });
    //make sure to return back the new table so that we can update the website
    getTable.on('requestCompleted', function(){
      res.json({status:200, table:subjectArray, message:"success"});
    });
    connection.execSql(getTable);
  });
  connection.execSql(updateSubject);
});
//add a subject to the table
router.post("/addSubject", function(req,res){
  var obj = req.body;
  var subjectArray = [];
  var updateSubject = new Request("INSERT INTO dbo."+req.user.username+"_subject_table (Subject, Hours, Number) VALUES (@subject, 0.0, 0)",
  function(err){
    if(err)
      console.log(err);
  }); 
  updateSubject.addParameter('subject', TYPES.VarChar, obj.subject);
  updateSubject.on('requestCompleted', function(){
    var getTable = new Request("SELECT * FROM dbo."+req.user.username+"_subject_table",
    function(err){
      if(err)
        console.log(err);
    });
    getTable.on('row', function(columns) {
      var rowObject ={};
      columns.forEach(function(column) {
          rowObject[column.metadata.colName] = column.value;
      });
      subjectArray.push(rowObject);
    });
    //again, make sure to send the table back when done to update html file
    getTable.on('requestCompleted', function(){
      res.json({status:200, table:subjectArray, message:"success"});
    });
    connection.execSql(getTable);
  });
  connection.execSql(updateSubject);
});

module.exports = router;
