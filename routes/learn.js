var express = require('express');
var router = express.Router();
var path = require('path');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const connection = require('../config/connection');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get("/", ensureAuthenticated, function(req,res, next){
    console.log(__dirname);
    res.sendFile(path.resolve(__dirname, "../learn-page.html"));
});


router.get("/search", function(req, res, next){
    //using req.query to get the parameters from the router. 
    //In this case, we specifically send something called search
    var searchItem = req.query.search;
    console.log(searchItem);
    res.redirect("/learn");
});


module.exports = router;