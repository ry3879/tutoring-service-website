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
const { execSql } = require('../config/connection');
const { connect } = require('http2');
const { create } = require('domain');

//function to get more 
router.get("/", ensureAuthenticated, function(req,res){
    //GET TOP 20 posts
    var getPosts = new Request(`SELECT TOP 20 ID, username, title, details, reposter, date_posted, likes, reposter, likedUser 
    FROM dbo.motivate_table t1 LEFT JOIN (SELECT * FROM dbo.likes_table WHERE likedUser = @user) t2 ON t1.ID = t2.likedID ORDER BY date_posted DESC`, function(err){
        if(err)
            console.log(err);
    });
    getPosts.addParameter('user', TYPES.VarChar, req.user.username);
    posts = [];
    getPosts.on('row', function(columns) {
        var rowObject ={};
        columns.forEach(function(column) {
            rowObject[column.metadata.colName] = column.value;
        });
        posts.push(rowObject);
    
    });
    getPosts.on('requestCompleted', function(){
        res.render(path.resolve(__dirname, "../motivate-page.html"), {posts: posts});
    });
    connection.execSql(getPosts);
});

router.post("/like", function(req,res){
    var like = new Request(`INSERT INTO dbo.likes_table (likedID, likedUser) VALUES (@ID, @username)`, function(err){
        if(err)
            console.log(err);
    });
    like.addParameter('ID', TYPES.UniqueIdentifier, req.body.ID);
    like.addParameter('username', TYPES.VarChar, req.user.username);
    like.on('requestCompleted', function(){
        var updateMotivate = new Request(`UPDATE dbo.motivate_table SET likes = likes + 1 WHERE ID = @ID`, function(err){
            if(err)
                console.log(err);
        });
        updateMotivate.addParameter('ID', TYPES.UniqueIdentifier, req.body.ID);
        updateMotivate.on('requestCompleted', function(){
            res.send({success:"success"});
        });
        connection.execSql(updateMotivate);
    });
    
    connection.execSql(like);
});
router.post("/unlike", function(req,res){
    var unlike = new Request(`DELETE FROM dbo.likes_table WHERE likedID = @ID AND likedUser = @username`, function(err){
        if(err)
            console.log(err);
    });
    unlike.addParameter('ID', TYPES.UniqueIdentifier, req.body.ID);
    unlike.addParameter('username', TYPES.VarChar, req.user.username);
    unlike.on('requestCompleted', function(){
        var updateMotivate = new Request(`UPDATE dbo.motivate_table SET likes = likes - 1 WHERE ID = @ID`, function(err){
            if(err)
                console.log(err);
        });
        updateMotivate.addParameter('ID', TYPES.UniqueIdentifier, req.body.ID);
        updateMotivate.on('requestCompleted', function(){
            res.send({success:"success"});
        });
        connection.execSql(updateMotivate);
    });
    connection.execSql(unlike);
});

router.post("/createmessage", function(req,res){
    var createMessage = new Request(`INSERT INTO dbo.motivate_table (username, title, details) VALUES (@username, @title, @details)`,
    function(err){
        if(err) console.log(err);
    });
    createMessage.addParameter('username', TYPES.VarChar, req.user.username);
    createMessage.addParameter('title', TYPES.VarChar, req.body.title);
    createMessage.addParameter('details', TYPES.VarChar, req.body.message);

    createMessage.on('requestCompleted', function(){
        res.send({success: "success"});
    });
    connection.execSql(createMessage);
});

module.exports = router;