/*This file is to handle the general server and stuff. Is this where we want to keep track of the stuff?*/
/*note:general idea. we still have a video.js file, we post the data instead. and then we do random crap */
//first try to convert this so that we're not using like classes and whatnot
//should also consider just putting this in app
"use strict";
exports.__esModule = true;
exports.Server = void 0;
var express = require("express");
var socket_io = require("socket.io");
var http = require("http");
var path = require("path");
var Server = /** @class */ (function () {
    function Server(inputApp) {
        this.activeSockets = [];
        this.DEFAULT_PORT = 3000;
        this.app = inputApp;
        //this.httpServer = inputServer;
        this.initialize();
    }
    Server.prototype.initialize = function () {
        //this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = socket_io(this.httpServer);
        this.configureApp();
        this.configureRoutes();
        this.handleSocketConnection();
    };
    Server.prototype.configureApp = function () {
        this.app.use(express.static(path.join(__dirname, "./public")));
    };
    Server.prototype.configureRoutes = function () {
        //instead here: we want to replace the / with something like /session/video
        //render it with the user :? only need the learner??? We're only calling for the learner sooo
        //we could pass along both too ig :// we can redirect from the form to another thing hmmmm
        //We'll need to check yourself and stuff to see if you're the learner or not. idk how you would do this though :/
        //we may need to post data instead 
        this.app.get("/session/video", function (req, res) {
            //we will want to render this file instead hmmmmmmm how to send things here?
            var ID = req.query.ID;
            var requested = req.query.requested;
            var accepted = req.query.accepted;
            var isRequested = false;
            if(requested===req.user.username)
                isRequested = true;
            res.render(path.join(__dirname,"./public/index.html"),{ID:ID,requested:requested, accepted:accepted,isRequested:isRequested});
        });
    };
    Server.prototype.handleSocketConnection = function () {
        var _this = this;
        this.io.on("connection", function (socket) {
            var user = socket.handshake.query.user;
            var existingSocket = _this.activeSockets.find(function (existingSocket) { return existingSocket.id === socket.id; });
            if (!existingSocket) {
                _this.activeSockets.push({user: user, id:socket.id});
                socket.emit("update-user-list", {
                    users: _this.activeSockets.filter(function (existingSocket) { return existingSocket.id !== socket.id; })
                });
                socket.broadcast.emit("update-user-list", {
                    users: [{user:user, id:socket.id}]
                });
                /*in here, do we also want to update our database? with user and socket connection?
                 We can then grab the socket connection later on and then pass it around. How can you pass it though? ...
                 Looks like you're emitting the socket id each time*/
            }
            socket.on("call-user", function (data) {
                socket.to(data.to).emit("call-made", {
                    offer: data.offer,
                    socket: socket.id,
                    name: data.name
                });
            });
            socket.on("make-answer", function (data) {
                socket.to(data.to).emit("answer-made", {
                    socket: socket.id,
                    answer: data.answer,
                    name: data.name
                });
            });
            socket.on("reject-call", function (data) {
                socket.to(data.from).emit("call-rejected", {
                    socket: socket.id,
                    name: data.name
                });
            });
            socket.on("disconnect", function () {
                _this.activeSockets = _this.activeSockets.filter(function (existingSocket) { return existingSocket.id !== socket.id; });
                socket.broadcast.emit("remove-user", {
                    socketId: socket.id
                });
            });
        });
    };
    Server.prototype.listen = function (callback) {
        var _this = this;
        this.httpServer.listen(this.DEFAULT_PORT, function () {
            callback(_this.DEFAULT_PORT);
        });
    };
    return Server;
}());
exports.Server = Server;
