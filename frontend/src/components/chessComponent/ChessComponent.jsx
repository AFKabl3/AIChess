import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Chess } from 'chess.js';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { formatUciMove } from '../../util/chessUtil';

export const ChessComponent = ({ onPlayerMove, lock }) => {
  // Holds the current state of the chess game, including positions of pieces, castling rights, etc.
  const [game, setGame] = useState(new Chess());

  // Tracks the initial square of the piece being moved (e.g., "e2").
  const [moveFrom, setMoveFrom] = useState('');

  // Tracks the target square of the piece move (e.g., "e4").
  const [moveTo, setMoveTo] = useState(null);

  // Flag to trigger the pawn promotion dialog if a pawn reaches the opposite side of the board.
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  // Tracks squares that have been right-clicked for marking, commonly used to highlight potential moves or key squares for reference.
  const [rightClickedSquares, setRightClickedSquares] = useState({});

  // Highlights squares related to the current move, like the start and target squares, to provide visual feedback on each move.
  const [moveSquares, setMoveSquares] = useState({});

  // Highlights squares to show valid moves when a piece is selected, using a unique color or style.
  const [optionSquares, setOptionSquares] = useState({});

  // State to hold the status message to be displayed to the user
  const [statusMessage, setStatusMessage] = useState('');

  // State to track if the game is over
  const [isGameOver, setIsGameOver] = useState(false);

  // Effect to check the game's status whenever the game state changes
  useEffect(() => {
    if (game.game_over()) {
      const winner = game.in_checkmate()
        ? game.turn() === 'w'
          ? 'Black wins!'
          : 'White wins!'
        : 'Draw!';
      setStatusMessage(winner);
      setIsGameOver(true);
      console.log(winner);
    } else if (game.in_check()) {
      const kingPos = getKingPosition(game);

      setOptionSquares({ [kingPos]: { backgroundColor: 'rgba(255, 0, 0, 0.5)' } });
    } else {
      setOptionSquares({});
    }
  }, [game]);

  /**
   * Retrieves the position of the king on the chessboard.
   *
   * @param {Object} game - The current chess game instance (from chess.js).
   *
   * @returns {string|null} The position of the king on the board in chess notation
   *                        (e.g., "e1") or `null` if the king is not found.
   *
   * This function searches through the current chessboard for the king ('k' piece with 'w/b' color)
   * and returns its position in standard chess notation.
   */
  function getKingPosition(game) {
    // Flatten the 2D board array and iterate over each square
    const kingPosition = []
      .concat(...game.board())
      .map((piece, index) => {
        // Check if the piece is the king
        if (piece !== null && piece.type === 'k' && piece.color === game.turn()) {
          return index;
        }
      })
      .filter(Number.isInteger);

    // If the king is found, convert the index to chess notation
    if (kingPosition.length > 0) {
      const pieceIndex = kingPosition[0];
      const row = 'abcdefgh'[pieceIndex % 8];
      const column = Math.ceil((64 - pieceIndex) / 8);
      return row + column;
    }

    // Return null if the king is not found
    return null;
  }

  /**
   * Safely mutates the current game state by applying a modification function.
   *
   * @param {Function} modify - A function that takes a game state object as an argument
   *                            and performs modifications on it. This function should
   *                            not return anything, as `safeGameMutate` will handle
   *                            updating the game state.
   *
   * This function ensures that modifications to the `game` state are done in a safe way
   * by using the `setGame` updater function. It creates a shallow copy of the current
   * game state, applies the modifications, and then returns the updated state, allowing
   * React to track changes and re-render as needed.
   */
  function safeGameMutate(modify) {
    let funcResult = null;
    setGame((g) => {
      const update = { ...g };
      funcResult = modify(update);

      return update;
    });

    return funcResult;
  }

  /**
   * Generates and displays potential moves for a given square on the chessboard.
   *
   * @param {string} square - The square on the chessboard for which to calculate move options
   *                          (e.g., 'e4').
   * @returns {boolean} - Returns `true` if there are valid moves for the selected square;
   *                      returns `false` if there are no valid moves.
   *
   * This function calculates the possible moves for a given square using `game.moves()`.
   * For each valid move, it updates the `newSquares` object with visual hints, such as
   * radial gradients, to indicate potential destinations. The color and style of the hint
   * differentiate between moves to empty squares and captures. If there are no valid moves
   * for the selected square, it clears the options by setting `setOptionSquares({})`.
   * If valid moves are found, it highlights the initial square in yellow and updates
   * `setOptionSquares` to reflect the potential moves on the board.
   */
  function getMoveOptions(square) {
    // Get all possible moves from the selected square, with details in verbose mode
    const moves = game.moves({ square, verbose: true });
    const newSquares = {};

    // If there are no moves available, reset option squares and exit
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    // Map over each possible move and set visual highlights on the board
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });

    // Highlight the original square in yellow to show the selected piece's position
    newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };

    // Update the board with the new highlights for potential moves
    setOptionSquares(newSquares);
    return true;
  }

  /**
   * Handles the logic when a square is clicked on the chessboard, determining valid moves, highlights,
   * and actions such as move validation and promotion dialog display.
   *
   * @param {string} square - The clicked square on the chessboard in standard chess notation (e.g., "e4").
   *
   * @returns {void} - This function doesn't return any value but updates various game states.
   *
   * The `onSquareClick` function serves to:
   * 1. Determine the origin and destination of a move, setting `moveFrom` and `moveTo`.
   * 2. If a starting square (`moveFrom`) hasn't been selected, it checks for possible moves
   *    from the clicked square and updates `moveFrom` if moves exist.
   * 3. If a starting square is selected but no valid move to the clicked square is found,
   *    it either sets `moveFrom` to a new piece if available or clears it.
   * 4. Upon finding a valid move, it updates the game state, handles promotions, and, if valid,
   *    applies the move and initiates a AI move (for the moment just a random one) afterward.
   * 5. It uses `setOptionSquares` to manage visual highlighting of squares and `setRightClickedSquares`
   *    to clear any right-click highlights.
   */
  function onSquareClick(square) {
    setRightClickedSquares({});

    // Set starting square for move
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);

      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // Set destination square for move
    if (!moveTo) {
      // Check if the clicked square is a valid destination
      const moves = game.moves({ moveFrom, verbose: true });
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

      // Handle invalid move by checking if a new piece was clicked
      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions ? square : '');
        return;
      }

      // Valid move - set moveTo and handle promotion if applicable
      setMoveTo(square);

      // If promotion move
      if (
        (foundMove.color === 'w' && foundMove.piece === 'p' && square[1] === '8') ||
        (foundMove.color === 'b' && foundMove.piece === 'p' && square[1] === '1')
      ) {
        setShowPromotionDialog(true);
        return;
      }

      // Handle regular move
      const gameCopy = { ...game };
      let move_UCI_notation = moveFrom + square;
      const move = gameCopy.move(move_UCI_notation, { sloppy: true });

      // Handle invalid move scenario
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      // Update game state, reset variables, and trigger AI move (for the moment a Random move)
      setGame(gameCopy);
      setTimeout(makeRandomMove, 300);
      setMoveFrom('');
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  /**
   * Handles the promotion of a pawn to a new piece, executing the move if a piece is selected
   * or canceling if no selection is made.
   *
   * @param {string} piece - The selected piece for promotion in shorthand notation (e.g., "Q" for Queen).
   * @param {string} fromSquare - The starting square of the promotion move (e.g., "e7").
   * @param {string} toSquare - The target square for the promotion move (e.g., "e8").
   *
   * @returns {void} - This function doesn't return any value but main functionality lies in updating the game state.
   *
   * This function performs the following:
   * 1. If a piece is selected, it creates a copy of the current game state and applies a promotion move
   *    from `moveFrom` to `moveTo` with the selected piece. If no specific piece is provided, it defaults
   *    to promoting to a Queen ("q").
   * 2. Updates the game state with the new move and triggers an AI move (for the moment only a random move).
   * 3. Clears selected moves (`moveFrom` and `moveTo`) and resets the promotion dialog and highlighted squares.
   */
  function onPromotionPieceSelect(piece, fromSquare, toSquare) {
    // If no piece selected (e.g., user canceled promotion dialog), reset and exit
    if (piece) {
      // Apply promotion move with selected piece, defaulting to Queen if undefined
      const move = safeGameMutate((game) => {
        return game.move({
          from: fromSquare,
          to: toSquare,
          promotion: piece[1].toLowerCase() ?? 'q',
        });
      });

      if (onPlayerMove) onPlayerMove(formatUciMove(move), game.fen());

      setTimeout(makeRandomMove, 300);
    }

    // Clear selected moves and reset dialog and highlighting states
    setMoveFrom('');
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return;
  }

  /**
   * Toggles a highlighted background color on a square when right-clicked, using a blue overlay.
   * If the square is already highlighted, it will remove the highlight.
   *
   * @param {string} square - The square on the chessboard that was right-clicked (e.g., "e4").
   *
   * This function performs the following:
   * 1. Defines a color variable `colour` for the highlight (a semi-transparent blue).
   * 2. Updates the `rightClickedSquares` state by either:
   *    - Applying the blue highlight to the specified square if it is not already highlighted.
   *    - Removing the highlight from the square if it is already highlighted.
   */
  function onSquareRightClick(square) {
    // Update right-clicked square highlights, toggling blue overlay on the clicked square
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  /**
   * Executes a random legal move for the computer.
   *
   * This function checks if the game is over or in a draw, and if there are no legal moves,
   * it will return immediately without making a move. If moves are available, it selects
   * one at random and plays it by updating the game state.
   *
   * @returns {void} This function has no return value.
   */
  function makeRandomMove() {
    const possibleMove = game.moves();

    // Exit if the game is over, in a draw, or there are no legal moves available
    if (game.game_over() || game.in_draw() || possibleMove.length === 0) return;

    // Select a random index within the range of available moves
    const randomIndex = Math.floor(Math.random() * possibleMove.length);

    // Play the randomly selected move and update the game state
    safeGameMutate((game) => game.move(possibleMove[randomIndex]));
  }

  /**
   * Handles the logic when a piece is dropped on the board.
   *
   * This function attempts to execute a move from the `source` square to the `target` square.
   * If the move is valid, it updates the game state; if not, it cancels the move. When a valid move
   * is made, the computer's random move function (`makeRandomMove`) is triggered with a delay.
   *
   * @param {string} source - The starting square of the piece being moved (e.g., "e2").
   * @param {string} target - The destination square for the piece (e.g., "e4").
   * @returns {boolean} Returns `true` if the move is valid, allowing it to be displayed; `false` if the move is invalid.
   */
  function onDrop(source, target) {
    if (lock) {
      toast('Please wait for a response from the last move', {
        icon: '⏳',
      });
      return false;
    }

    let move = null;

    const currBoard = game.fen();

    // Try to make a move from source to target; promote pawns to queens by default
    safeGameMutate((game) => {
      move = game.move({ from: source, to: target, promotion: 'q' });
    });

    // If the move is invalid, return false to indicate an illegal move
    if (move == null) return false;

    if (onPlayerMove) onPlayerMove(formatUciMove(move), currBoard);

    // If the move is valid, trigger a random computer move after a 200ms delay
    setTimeout(makeRandomMove, 200);
    return true;
  }

  return (
    <Container
      sx={{
        position: 'relative',
        minHeight: '100vh', // Makes the box cover the full viewport height
        minWidth: '100vw', // Makes the box cover the full viewport width
        display: 'flex', // Centers children inside the box
        alignItems: 'center', // Centers children vertically
        justifyContent: 'center', // Centers children horizontally
      }}
    >
      <Box
        sx={{
          width: '40%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative', // Added to allow absolute positioning inside this box
          alignItems: 'center', // Center the board and message horizontally
        }}
      >
        <Chessboard
          className="customBoardStyle"
          position={game.fen()}
          onPieceDrop={onDrop}
          animationDuration={200}
          arePiecesDraggable={true}
          onPieceDragBegin={(_, square) => getMoveOptions(square)}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          promotionToSquare={moveTo}
          showPromotionDialog={showPromotionDialog}
          customBoardStyle={{
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
          customSquareStyles={{ ...moveSquares, ...optionSquares, ...rightClickedSquares }}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#EEEED2' }}
        />

        {/* Game over message overlay */}
        {isGameOver && (
          <Stack
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: 2,
              borderRadius: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {statusMessage}
            </Typography>
          </Stack>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '2',
            gap: '3',
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{ margin: '10px' }}
            onClick={() => {
              safeGameMutate((game) => {
                game.reset();
              });
              setMoveSquares({});
              setOptionSquares({});
              setRightClickedSquares({});
              setStatusMessage('');
              setIsGameOver(false);
            }}
          >
            reset
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

ChessComponent.propTypes = {
  onPlayerMove: PropTypes.func,
  lock: PropTypes.bool.isRequired,
};