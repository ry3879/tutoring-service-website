var express = require('express');
var router = express.Router();
//var Connection = require('tedious').Connection;
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
  
  router.post("/updateBio", function(req,res){
    var obj = req.body;
    var updateBio = new Request("UPDATE dbo.profile_table SET bio = \'" + obj.bio + "\' WHERE username = @username",
    function(err){
      console.log(err);
    }); 
    updateBio.addParameter('username', TYPES.VarChar, req.user.username);
    connection.execSql(updateBio);
  });
  router.post("/updateEdu", function(req,res){
    var obj = req.body;
    var updateBio = new Request("UPDATE dbo.profile_table SET eduLevel = \'" + obj.edu + "\' WHERE username = @username",
    function(err){
      console.log(err);
    }); 
    updateBio.addParameter('username', TYPES.VarChar, req.user.username);
    connection.execSql(updateBio);
  });
  router.post("/removeSubject", function(req,res){
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
  router.post("/addSubject", function(req,res){
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

module.exports = router;
