var express = require('express');
var router = express.Router();
var path = require('path');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use( bodyParser.json() ); 
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const connection = require('../config/connection');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
//router.engine('html', require('ejs').renderFile);

router.get("/", ensureAuthenticated, function(req,res, next){
    //get items that are of requested user or a general request
    var request = new Request('SELECT * FROM dbo.learn_requests_table WHERE (requested IS NULL OR requested = @user)', function(err){
        if(err)
            console.log(err);
    });
    request.addParameter('user', TYPES.VarChar, req.user.username);
    subjectArray = [];
    request.on('row', function(columns){
        var rowObject = {};
        columns.forEach(function(column){
            rowObject[column.metadata.colName] = column.value;
        });
        subjectArray.push(rowObject);
    });
    request.on('requestCompleted', function(columns){
        //console.log(subjectArray);
        res.render(path.resolve(__dirname, "../learn-page.html"), {requests:subjectArray});
    });
    connection.execSql(request);
});

router.get("/search", ensureAuthenticated, function(req, res, next){
    //using req.query to get the parameters from the router. 
    //In this case, we specifically send something called search
    var searchItem = req.query.search;
    //search for search item among subjects
    var request = new Request('SELECT * FROM dbo.learn_requests_table WHERE subject = @search AND (requested IS NULL OR requested = @user)', function(err){
        if(err)
            console.log(err);
    });
    request.addParameter('search', TYPES.VarChar, searchItem);
    request.addParameter('user', TYPES.VarChar, req.user.username);
    subjectArray = [];
    userArray = [];
    request.on('row', function(columns){
        var rowObject = {};
        columns.forEach(function(column){
            rowObject[column.metadata.colName] = column.value;
        });
        subjectArray.push(rowObject);
    });
    request.on('requestCompleted', function(columns){
        //search for search item among users
        var request2 = new Request('SELECT * FROM dbo.learn_requests_table where username = @search AND (requested IS NULL OR requested = @user)', function(err){
            if(err)
                console.log(err);
        });
        request2.addParameter('search', TYPES.VarChar, searchItem);
        request2.addParameter('user', TYPES.VarChar, req.user.username);
        request2.on('row', function(columns){
            var rowObject = {};
            columns.forEach(function(column){
                rowObject[column.metadata.colName] = column.value;
            });
            userArray.push(rowObject);
        });
        request2.on('requestCompleted', function(){
            
            res.render(path.resolve(__dirname, "../learn-search-page.html"), {users:userArray, subject:subjectArray});
        });
        connection.execSql(request2);
    });
    connection.execSql(request);
});


module.exports = router;