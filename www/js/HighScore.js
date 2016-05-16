// Credits screen
Vortex.HighScore = function(game) {

    // Class members
    this.socket = null;
    this.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
                     'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                     'Y', 'Z', ' '];
    this.firstInitial = null;
    this.secondInitial = null;
    this.thirdInitial = null;
    this.offset = -40;
};

Vortex.HighScore.prototype = {
    
    create: function() {
        
        // Create a socket.io object
        this.socket = io();
        
        // Send out the score
        this.socket.emit('score', Vortex.score);
        
        // Style for text
        var style = {font: '24px Helvetica',
                     fill: '#ffffff',
                     align: 'left'};
        var scoreStyle = {font: '24px Courier',
                           fill: '#ffffff',
                           align: 'right'};
                     
        // Add lives and points text
        this.add.text(490, 10, 'Score', style).anchor.set(1, 0);
        this.add.text(490, 35, Vortex.score, scoreStyle).anchor.set(1, 0);
        
        // Game over text
        var overText = this.add.text(game.width / 2, game.height / 2,
            "Game Over", {
            font: '50px Helvetica',
            fill: '#ffffff',
            align: 'center'
        });
        overText.anchor.set(0.5);
        
        // Set timeout to return to Title screen
        var that = this;
        var timeout = setTimeout(function() {
            that.returnToTitle();
        }, 2000);
        
        // Wait for request from server for initials
        this.socket.on('initialsRequest', function(msg) {
            console.log("Global high score!");
            game.world.remove(overText);
            clearTimeout(timeout);
            that.getInitials();
        });
    },
    
    getInitials: function() {
    
        // Add sound/mute button
        this.soundButton = game.add.button(80, 10, 'icon_sound', 
            this.toggleSound, this);
        this.soundButton.scale.set(0.6);
        if (Vortex.soundEnabled) {
            this.soundButton.frame = 0;
        } else {
            this.soundButton.frame = 1;
        }
        
        // High score message
        var style = {
            font: "24px Helvetica",
            fill: "#ffffff",
            align: "center"
        };
        this.add.text(game.width / 2, 70,
            "Global high score!\nSubmit your initals:", style).anchor.set(0.5);
            
        // Initials
        style = {
            font: "56px Helvetica",
            fill: "#ffffff",
            align: "center"
        };
        this.firstInitial = this.add.text(game.width / 4, game.height / 2 + 
            this.offset, this.alphabet[0], style);
        this.firstInitial.anchor.set(0.5);
        this.secondInitial = this.add.text(game.width / 2, game.height / 2 + 
            this.offset, this.alphabet[0], style);
        this.secondInitial.anchor.set(0.5);
        this.thirdInitial = this.add.text(3 * game.width / 4, game.height / 2 + 
            this.offset, this.alphabet[0], style);
        this.thirdInitial.anchor.set(0.5);
            
        // Add arrow buttons for first initial
        var firstInitialUpButton = this.add.button(game.width / 4, 
            game.height / 2 - 60 + this.offset, 'button_arrow', function() {
                this.changeInitial(this.firstInitial, true);
            }, this);
        firstInitialUpButton.anchor.set(0.5);
        var firstInitialDownButton = this.add.button(game.width / 4, 
            game.height / 2 + 60 + this.offset, 'button_arrow', function() {
                this.changeInitial(this.firstInitial, false);
            }, this);
        firstInitialDownButton.anchor.set(0.5);
        firstInitialDownButton.angle = 180;
        
        // Add arrow buttons for second initial
        var secondInitialUpButton = this.add.button(game.width / 2, 
            game.height / 2 - 60 + this.offset, 'button_arrow', function() {
                this.changeInitial(this.secondInitial, true);
            }, this);
        secondInitialUpButton.anchor.set(0.5);
        var secondInitialDownButton = this.add.button(game.width / 2, 
            game.height / 2 + 60 + this.offset, 'button_arrow', function() {
                this.changeInitial(this.secondInitial, false);
            }, this);
        secondInitialDownButton.anchor.set(0.5);
        secondInitialDownButton.angle = 180;
        
        // Add arrow buttons for third initial
        var thirdInitialUpButton = this.add.button(3 * game.width / 4, 
            game.height / 2 - 60 + this.offset, 'button_arrow', function() {
                this.changeInitial(this.thirdInitial, true);
            }, this);
        thirdInitialUpButton.anchor.set(0.5);
        var thirdInitialDownButton = this.add.button(3 * game.width / 4, 
            game.height / 2 + 60 + this.offset, 'button_arrow', function() {
                this.changeInitial(this.thirdInitial, false);
            }, this);
        thirdInitialDownButton.anchor.set(0.5);
        thirdInitialDownButton.angle = 180;
        
        // Add OK and CANCEL buttons
        var okButton = game.add.button(game.width / 3, 
            game.height / 2 + 125, 'button_ok', this.submit, this);
        var cancelButton = game.add.button(2 * game.width / 3,
            game.height / 2 + 125, 'button_cancel', this.cancel, this);
            
        // Center all buttons
        okButton.anchor.set(0.5);
        cancelButton.anchor.set(0.5);
        
        // Scale all buttons
        okButton.scale.set(0.5);
        cancelButton.scale.set(0.5);
    },
    
    changeInitial: function(text, up) {
    
        // Find the next character in the alphabet
        var idx = this.alphabet.indexOf(text.text);
        if (up) {
            idx = (idx + 1) % this.alphabet.length;
        } else {
            idx = (idx + this.alphabet.length - 1) % this.alphabet.length;
        }
        
        // Display character
        text.setText(this.alphabet[idx]);   
    },
    
    submit: function() {
    
        // Concatenate initials and send to server
        var initials = this.firstInitial.text.concat(this.secondInitial.text)
        initials = initials.concat(this.thirdInitial.text);
        this.socket.emit('initialsScore', {
            initials: initials,
            score: Vortex.score
        });
        this.returnToTitle();
    },
    
    cancel: function() {
        this.returnToTitle();
    },
    
    toggleSound: function() {
        
        // Toggle sound and update icon. Also, pause and play music.
        Vortex.soundEnabled = !Vortex.soundEnabled;
        if (Vortex.soundEnabled) {
            this.soundButton.frame = 0;
            Vortex.music.resume();
        } else {
            this.soundButton.frame = 1;
            Vortex.music.pause();
        }
    },
    
    returnToTitle: function() {
        game.state.start('Title');
    }
};