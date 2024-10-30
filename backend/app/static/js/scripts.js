$(document).ready(function(){
    var board = null;
    var game = new Chess();  // Instantiation of the chess game

    // Function that prevents invalid piece movements
    function onDragStart(source, piece, position, orientation) {
        // Only allow piece movements if the game is not over and
        // prevent players from moving the opponent's pieces
        if (game.game_over() || 
            (game.turn() === 'w' && piece.search(/^b/) !== -1) || 
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    }

    // Function to handle piece movements
    function onDrop(source, target) {
        // Attempt to make a move using Chess.js
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // Promote to queen by default for simplicity
        });

        // If the move is invalid, snap the piece back to its original position
        if (move === null) return 'snapback';

        // Update the board after a valid move
        updateBoard();
    }

    // Update the chessboard
    function updateBoard() {
        board.position(game.fen());
    }

    // Update the board after the piece is dropped
    function onSnapEnd() {
        board.position(game.fen());
    }

    var config = {
        draggable: true,
        position: 'start',
        pieceTheme: '/static/img/chesspieces/wikipedia/{piece}.png',  // Path to the images
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };
    
    var board = Chessboard('board', config);
    

    // Handle game reset
    $('#reset').click(function() {
        game.reset();  // Reset the chess game state
        board.start(); // Reset the board to the starting position
    });
});
