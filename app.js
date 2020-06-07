var express = require('express');
var app = express();
var path = require('path');

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

//All image files will go under public/images
app.use(express.static('public'));

//set the port to 3000
var port = "3000";
app.set('port', port);
module.exports = app;
