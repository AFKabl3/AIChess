import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { getKingPosition } from '../util/chessUtil';
import { waitForResponseToast } from '../util/toasts';

export const useChess = ({ onPlayerMove, onBotMove, lock, isPaused, config }) => {
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

  // Highlights squares to show valid moves when a piece is selected, using a unique color or style.
  const [optionSquares, setOptionSquares] = useState({});

  // State to hold the status message to be displayed to the user
  const [statusMessage, setStatusMessage] = useState('');

  // State to track if the game is over
  const [isGameOver, setIsGameOver] = useState(false);

  // State to track custom arrows, are on the form [[from, to], [from, to], ...]
  const [arrows, setArrows] = useState([]);

  const resetGame = () => {
    safeGameMutate((game) => {
      game.reset();
    });
    setOptionSquares({});
    setRightClickedSquares({});
    setStatusMessage('');
    setIsGameOver(false);
    setArrows([]);
  };

  const showStatusMessage = (message) => {
    setStatusMessage(message);

    setTimeout(() => {
      setStatusMessage('');
    }, 2500);
  };

  // Effect to check the game's status whenever the game state changes
  useEffect(() => {
    if (game.game_over()) {
      const winner = game.in_checkmate()
        ? game.turn() === 'w'
          ? 'Black wins!'
          : 'White wins!'
        : 'Draw!';
      showStatusMessage(winner);
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
   * Safely mutates the current game state by applying a modification function.
   *
   * @param {Function} modify - A function that takes a game state object as an argument
   *                            and performs modifications on it.
   *
   * This function ensures that modifications to the `game` state are done in a safe way
   * by using the `setGame` updater function. It creates a shallow copy of the current
   * game state, applies the modifications, and then returns the updated state, allowing
   * React to track changes and re-render as needed.
   */
  const safeGameMutate = (modify) => {
    let funcResult = null;
    setGame((g) => {
      const update = { ...g };
      funcResult = modify(update);

      return update;
    });

    return funcResult;
  };

  /**
   * Generates and displays potential moves for a given square on the chessboard.
   *
   * @param {string} square - The square on the chessboard for which to calculate move options
   *                          (e.g., 'e4').
   * @returns {boolean} - Returns `true` if there are valid moves for the selected square;
   *                      returns `false` if there are no valid moves.
   */
  const getMoveOptions = (square) => {
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
  };

  const makeBotMove = async () => {
    const skillLevel = config.SKILL_LEVEL;

    if (skillLevel === 0) {
      setTimeout(makeRandomMove, 150);
      return;
    }

    const fetchMove = async () => {
      const res = await api.getBotMove(game.fen(), skillLevel);
      const data = await res.json();

      return data.bot_move;
    };

    try {
      const move = await fetchMove();
      if (move) {
        const prevFen = game.fen();

        const successfulMove = safeGameMutate((game) => {
          return game.move(move, { sloppy: true });
        });
        if (successfulMove && onBotMove) onBotMove(successfulMove, prevFen, game.fen());
      } else {
        setTimeout(makeRandomMove, 150);
      }
    } catch (error) {
      console.error(error);
      setTimeout(makeRandomMove, 150);
    }
  };

  const addArrow = (arrow) => {
    setArrows([...arrows, arrow]);
  };

  const resetArrows = () => {
    setArrows([]);
  };

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
  const onSquareClick = (square) => {
    setRightClickedSquares({});
    if (isPaused) return; // Disable piece movement if game is paused
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

      // If the board is locked, show a toast and return from function
      if (lock) {
        waitForResponseToast();
        return false;
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

      const prevFen = game.fen();

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
      resetArrows();
      if (onPlayerMove) onPlayerMove(move, prevFen, game.fen());
      setGame(gameCopy);
      makeBotMove();
      setMoveFrom('');
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  };

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
  const onPromotionPieceSelect = (piece, fromSquare, toSquare) => {
    // If no piece selected (e.g., user canceled promotion dialog), reset and exit
    if (piece) {
      const prevFen = game.fen();

      // Apply promotion move with selected piece, defaulting to Queen if undefined
      const move = safeGameMutate((game) => {
        return game.move({
          from: fromSquare,
          to: toSquare,
          promotion: piece[1].toLowerCase() ?? 'q',
        });
      });

      if (onPlayerMove) onPlayerMove(move, prevFen, game.fen());
      resetArrows();

      makeBotMove();
    }

    // Clear selected moves and reset dialog and highlighting states
    setMoveFrom('');
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return;
  };

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
  const onSquareRightClick = (square) => {
    // Update right-clicked square highlights, toggling blue overlay on the clicked square
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  };

  /**
   * Executes a random legal move for the computer.
   *
   * This function checks if the game is over or in a draw, and if there are no legal moves,
   * it will return immediately without making a move. If moves are available, it selects
   * one at random and plays it by updating the game state.
   *
   * @returns {void} This function has no return value.
   */
  const makeRandomMove = () => {
    const possibleMove = game.moves();
    if (game.game_over() || game.in_draw() || possibleMove.length === 0) return;
    const randomIndex = Math.floor(Math.random() * possibleMove.length);
    const move = game.move(possibleMove[randomIndex]); // TODO: Change to safe game mutate
    if (move && onBotMove) onBotMove(move, null, game.fen());
    setGame(new Chess(game.fen()));
  };

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
  const onDrop = (source, target) => {
    if (isPaused) return false; // Disable drop if game is paused
    if (lock) {
      waitForResponseToast();
      return false;
    }

    let move = null;

    const prevFen = game.fen();

    // Try to make a move from source to target; promote pawns to queens by default
    safeGameMutate((game) => {
      move = game.move({ from: source, to: target, promotion: 'q' });
    });

    // If the move is invalid, return false to indicate an illegal move
    if (move == null) return false;

    if (onPlayerMove) onPlayerMove(move, prevFen, game.fen());
    resetArrows();

    // If the move is valid, trigger a random computer move after a 200ms delay
    makeBotMove();
    return true;
  };

  const loadGame = (fen) => {
    setGame(new Chess(fen));
    resetArrows();
  };

  return {
    position: game.fen(),
    onDrop,
    onPieceDragBegin: (_, square) => getMoveOptions(square),
    onPieceDragEnd: (_, square) => setMoveFrom(square),
    onSquareClick,
    onSquareRightClick,
    onPromotionPieceSelect,
    showPromotionDialog,
    optionSquares,
    rightClickedSquares,
    isGameOver,
    statusMessage,
    resetGame,
    moveTo,
    loadGame,
    arrows,
    addArrow,
    resetArrows,
  };
};
