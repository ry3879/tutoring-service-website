var express = require('express');
var router = express.Router();
var path = require('path');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json()); 
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const connection = require('../config/connection');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const flash = require('connect-flash');

router.get('/', ensureAuthenticated, function(req,res){
    var request = new Request("SELECT * FROM dbo.learn_requests_table WHERE username = @user", function(err){
        if(err)
            console.log(err);
    });
    request.addParameter("user", TYPES.VarChar, req.user.username);
    requestArray = [];
    request.on("row", function(columns){
        var rowObject ={};
        columns.forEach(function(column) {
            rowObject[column.metadata.colName] = column.value;
        });
        requestArray.push(rowObject);
    });
    request.on("requestCompleted", function(){
        res.render(path.resolve(__dirname, "../learn-page.html"), {requests:requestArray});
    });
    connection.execSql(request);
});

router.post('/request', ensureAuthenticated, function(req,res){
    var requested = req.body.requested;
    var length = requested.length;
    var requestQuery = "INSERT INTO dbo.learn_requests_table (username, subject, details, requested) VALUES ";
    for(var i = 0; i < length-1; i++){
        requestQuery += "(@username"+i+", @subject"+i+", @details"+i+", @requested"+i+"),"
    }
    requestQuery += "(@username"+(length-1)+", @subject"+(length-1)+", @details"+(length-1)+", @requested"+(length-1)+")";
    if(req.body.general==true){
        requestQuery += ",(@username"+length+", @subject"+length+", @details"+length+", @requested"+length+")"
    }
    //console.log(requestQuery);
    var request = new Request(requestQuery,
    function(err){
        if(err){
            console.log(err);
            req.flash("error_msg", "There was an error in submitting your requests.");
            res.send({error:"One of your requests failed."});
        }
    });
    for(var i = 0; i < length; i++){
        request.addParameter("username" +i, TYPES.VarChar, req.user.username);
        request.addParameter("subject" +i, TYPES.VarChar, req.body.subject);
        request.addParameter("details" +i, TYPES.VarChar, req.body.details);
        //figure out how to do the whole requested thing, otherwise, add more subject
        request.addParameter("requested"+i, TYPES.VarChar, requested[i]);   
    }
    if(req.body.general==true){
        request.addParameter("username" +length, TYPES.VarChar, req.user.username);
        request.addParameter("subject" +length, TYPES.VarChar, req.body.subject);
        request.addParameter("details" +length, TYPES.VarChar, req.body.details);
        //figure out how to do the whole requested thing, otherwise, add more subject
        request.addParameter("requested"+length, TYPES.VarChar, null);
    }
    request.on('requestCompleted', function(){
        req.flash('success_msg', "You have successfully submitted all your request");
        //note if there are multiple users, then we want to do multiple requests, and we should add them onto the flash
        //Also we can include multiple queries in one thing.
        res.send({success:"You sent your requests."});
    });
    connection.execSql(request);
});
router.post("/cancel", function(req,res){
    var ID = req.body.ID;
    var queryRequest = "DELETE FROM dbo.learn_requests_table WHERE dbo.learn_requests_table.ID = @ID; "+
    "DELETE FROM dbo.accepted_requests_table WHERE dbo.accepted_requests_table.ID = @ID; "+
    "DELETE FROM dbo.rejected_requests_table WHERE dbo.rejected_requests_table.ID = @ID;";
    var request = new Request(queryRequest, function(err){
        if(err)
            console.log(err);
    });
    request.addParameter("ID", TYPES.UniqueIdentifier, ID);
    request.on("requestCompleted", function(){
        res.send({success:"success"});
    });
    connection.execSql(request);
});
module.exports = router;