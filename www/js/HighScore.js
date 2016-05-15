// Credits screen
Vortex.HighScore = function(game) {};
Vortex.HighScore.prototype = {
    
    create: function() {
        
        // Create a socket.io object
        var socket = io();
        
        // Send out the score
        socket.emit('score', Vortex.score);
        
        this.returnToTitle();
    },
    
    returnToTitle: function() {
        game.state.start('Title');
    }
};