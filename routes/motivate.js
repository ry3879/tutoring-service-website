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

//function to get more 
router.get("/", ensureAuthenticated, function(req,res){
    res.sendFile(path.resolve(__dirname, "../motivate-page.html"));
});
//function to get more posts
//router.get("/moreposts", function(req,res){
    //get the top 5 posts than you haven't seen

//});

module.exports = router;