/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting

/**
 * Simple web server based on 
 * http://expressjs.com/en/starter/hello-world.html
 *
 * Prerequisites:
 *  - Node
 *  - Express (npm install express)
 * 
 * To use, save as a file (e.g. SimpleServer.js) and run with:
 *  node SimpleServer.js /PATH/TO/WWW/
 */
 
// Parameters
var sitePath = "www";
var port = 80;

// Libraries
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Request logging
app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

// Create a handler for when a client connects via socket.io
io.on('connection', function(socket) {
    var clientIP = socket.client.conn.remoteAddress;

    // If we get a score, compare it to other scores
    socket.on('score', function(msg) {
        console.log(clientIP + ": " + msg);
        //io.emit('score', clientIP + ": " + msg);
    });
});

// Start server
console.log(sitePath);
console.log("Starting server in: " + __dirname + '/' + sitePath);
app.use(express.static(__dirname + '/' + sitePath));
http.listen(port, function() {
    console.log("Server running at: http://localhost:" + port);
});