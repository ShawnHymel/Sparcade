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
var highscoresFile = "highscores.json"

// Libraries
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var five = require('johnny-five');
var Edison = require('edison-io');

// LCD object
var lcd;

// Read high scores
var scoreContent = fs.readFileSync(__dirname + "/" + highscoresFile);
scoreContent = JSON.parse(scoreContent);
console.log(scoreContent);

// Create a new Johnny-Five board object that we will use to talk to the LCD
var board = new five.Board({
    io: new Edison()
});

// Initialization callback that is called when Johnny-Five is done initializing
board.on('ready', function() {

    // Create our LCD object and define the pins
    // LCD pin name:    RS  EN DB4 DB5 DB6 DB7
    // Edison GPIO:     14  15  44  45  46  47
    lcd = new five.LCD({
        pins: ["GP14", "GP15", "GP44", "GP45", "GP46", "GP47"],
        rows: 2,
        cols: 16
    });

    // Make sure the LCD is on, has been cleared, and the cursor is set to home
    lcd.on();
    lcd.clear();
    lcd.home();

    // Print a splash string
    lcd.print("High Scores");
    
    // Cycle through high scores
    var idx = 0;
    setInterval(function() {
        
        var text_1;
        var text_2;
        var space;
        
        // Reset lcd
        lcd.clear();
        lcd.home();
        
        // Create string to display
        if (idx + 1 < 10) {
            space = ".  ";
        } else {
            space = ". ";
        }
        text_1 = (idx + 1).toString() + space + 
            scoreContent.highscores[idx].initials + " " + 
            scoreContent.highscores[idx].score;
        if (idx < scoreContent.highscores.length) {
            if (idx + 2 < 10) {
                space = ".  ";
            } else {
                space = ". ";
            }
            text_2 = (idx + 2).toString() + space + 
                scoreContent.highscores[idx + 1].initials + " " + 
                scoreContent.highscores[idx + 1].score;
        } else {
            text_2 = "";
        }
        
        // Show text on LCD
        lcd.print(text_1);
        lcd.cursor(1, 0);
        lcd.print(text_2);
        
        // Increment the index
        idx += 2;
        if (idx >= scoreContent.highscores.length) {
            idx = 0;
        }
    }, 3000);
});

// Request logging
app.use(function(req, res, next) {
    if (req.url === '/') {
        console.log("Serving game");
    }
    next();
});

// Create a handler for when a client connects via socket.io
io.on('connection', function(socket) {
    var clientIP = socket.client.conn.remoteAddress;

    // If we get a score, compare it to other scores
    socket.on('score', function(score) {
        console.log(clientIP + ": " + score);
        if (score > scoreContent.highscores[scoreContent.highscores.length - 1].score) {
            console.log("High score! Requesting initials");
            socket.emit('initialsRequest', '');
        }
    });
    
    // If we get initials back, store them with the high scores
    socket.on('initialsScore', function(msg) {
        console.log(msg.initials + ": " + msg.score);
        
        // Check for top score
        if (msg.score > scoreContent.highscores[0].score) {
            scoreContent.highscores.splice(0, 0, {
                        "initials": msg.initials, 
                        "score": msg.score
            });
            scoreContent.highscores.splice(-1, 1);
            
        // Check for other placement in high scores
        } else {
            for (var i = scoreContent.highscores.length - 1; i >= 0; i--) {
                if ((msg.score <= scoreContent.highscores[i].score) || 
                    (i === 0)) {
                    if (i === scoreContent.highscores.length - 1) {
                        scoreContent.highscores.push({
                            "initials": msg.initials, 
                            "score": msg.score
                        });
                    } else {
                        scoreContent.highscores.splice(i + 1, 0, {
                            "initials": msg.initials, 
                            "score": msg.score
                        });
                    }
                    console.log(scoreContent.highscores);
                    scoreContent.highscores.splice(-1, 1);
                    break;
                }
            }
        }
        console.log(scoreContent.highscores);
        
        // Write high scores to file
        fs.writeFile(__dirname + "/" + highscoresFile, 
                     JSON.stringify(scoreContent, null, 4), function(err) {
            if (err) {
                console.log("Cound not save high scores: " + err);
            } else {
                console.log("High scores saved");
            }
        });
    })
});

// Start server
console.log(sitePath);
console.log("Starting server in: " + __dirname + '/' + sitePath);
app.use(express.static(__dirname + '/' + sitePath));
http.listen(port, function() {
    console.log("Server running at: http://localhost:" + port);
});