import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { getKingPosition } from '../util/chessUtil';
import { waitForResponseToast } from '../util/toasts';

export const useChess = ({ onPlayerMove, onBotMove, lock, isPaused, config, setConfigValue }) => {
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

  const [whiteTime, setWhiteTime] = useState(60);
  const [blackTime, setBlackTime] = useState(60);
  const [increment, setIncrement] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null); // To track the timer
  const [timers, setTimers] = useState({ white: 0, black: 0 });
  const [gameMode, setGameMode] = useState(); // Selected game mode at the begin

  // Percentage of probability of both players winning
  const [whitePercentage, setWhitePercentage] = useState(50.0);
  const [blackPercentage, setBlackPercentage] = useState(50.0);

  // Start the timer for the active player
  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime((time) => {
          if (time <= 0) {
            clearInterval(interval);
            config.selectedColor === 'w' &&
              (showStatusMessage("White's time is up! Black wins!"), setIsGameOver(true));
            stopTimer();
            return 0;
          }
          return time - 1;
        });
      } else {
        setBlackTime((time) => {
          if (time <= 0) {
            clearInterval(interval);
            config.selectedColor === 'b' &&
              (showStatusMessage("Black's time is up! White wins!"), setIsGameOver(true));
            stopTimer();
            return 0;
          }
          return time - 1;
        });
      }
    }, 1000);

    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
  };

  // Switch the active player and restart their timer
  const switchPlayer = () => {
    const previousPlayer = game.turn() === 'w' ? 'b' : 'w';
    // Add increment to the current player's timer
    if (previousPlayer === 'w') {
      setWhiteTime((time) => time + increment);
    } else {
      setBlackTime((time) => time + increment);
    }
    startTimer();
  };

  // Initialize timers for a new game
  const initializeTimers = (minutes, seconds) => {
    const totalSeconds = minutes * 60;
    setWhiteTime(totalSeconds);
    setBlackTime(totalSeconds);
    setIncrement(seconds);
    stopTimer();
    startTimer();
    setTimers({ white: totalSeconds, black: totalSeconds });
  };

  const disableTimers = () => {
    stopTimer();
    setWhiteTime(0);
    setBlackTime(0);
    setIncrement(0);
    setTimerInterval(null);
    setGameMode(null);
  };
  const getGameMode = (gameMode) => {
    setGameMode(gameMode);
  };

  const handleMoveTimerSwitch = () => {
    stopTimer();
    switchPlayer();
  };

  const resetGame = () => {
    safeGameMutate((game) => {
      game.reset();
    });
    setOptionSquares({});
    setRightClickedSquares({});
    setStatusMessage('');
    setIsGameOver(false);
    setArrows([]);
    disableTimers();
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
      stopTimer();
      
      console.log(winner);
    } else if (game.in_check()) {
      const kingPos = getKingPosition(game);

      setOptionSquares({ [kingPos]: { backgroundColor: 'rgba(255, 0, 0, 0.5)' } });
    } else {
      setOptionSquares({});
    }
  }, [game]);

  useEffect(() => {
    if (
      !isPaused &&
      !config.fullControlMode &&
      config.startedGame &&
      config.selectedColor !== game.turn()
    )
      setTimeout(makeBotMove, 100);
  }, [game, config.startedGame]);

  useEffect(() => {
      // Simula una chiamata API per aggiornare le percentuali
      const fetchProbabilities = async () => {
        try {
          const res = await api.getWinningPercentage(game.fen());
          const data = await res.json();
          const { current_player, percentage } = data;
  
          setWhitePercentage(current_player === 'w' ? percentage : 100.0 - percentage);
          setBlackPercentage(current_player === 'b' ? percentage : 100.0 - percentage);

        } catch (error) {
          console.error("Error fetching probabilities:", error);
        }
      };
  
      fetchProbabilities();
    }, [game.turn()]);

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
        if (gameMode === 'timed') handleMoveTimerSwitch();
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
    if (isPaused || (gameMode === 'timed' && isGameOver)) return;

    const isPromotionMove = (move, square) => {
      return (
        (move.color === 'w' && move.piece === 'p' && square[1] === '8') ||
        (move.color === 'b' && move.piece === 'p' && square[1] === '1')
      );
    };

    // Set starting square for move
    if (!moveFrom) {
      if (getMoveOptions(square)) setMoveFrom(square);
      return;
    }

    // Set destination square for move
    if (!moveTo) {
      // Check if the clicked square is a valid destination
      const moves = game.moves({ moveFrom, verbose: true });
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

      // Handle invalid move by checking if a new piece was clicked
      if (!foundMove) {
        setMoveFrom(getMoveOptions(square) ? square : '');
        return;
      }

      // If the board is locked, show a toast and return from function
      if (lock) {
        waitForResponseToast();
        return;
      }

      // Valid move - set moveTo and handle promotion if applicable
      setMoveTo(square);

      // If promotion move
      if (isPromotionMove(foundMove, square)) {
        setShowPromotionDialog(true);
        return;
      }

      const prevFen = game.fen();

      // Handle regular move
      const gameCopy = { ...game };
      let move_UCI_notation = moveFrom + square;
      const move = gameCopy.move(move_UCI_notation, { sloppy: true });

      // Handle invalid move scenario
      if (!move) {
        if (getMoveOptions(square)) setMoveFrom(square);
        return;
      }

      // Update game state, reset variables, and trigger AI move (for the moment a Random move)
      resetArrows();
      if (onPlayerMove) onPlayerMove(move, prevFen, game.fen());
      setGame(gameCopy);
      setMoveFrom('');
      setMoveTo(null);
      setOptionSquares({});
      if (move !== null && gameMode === 'timed') handleMoveTimerSwitch();
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

      if (!fromSquare && moveFrom) fromSquare = moveFrom;

      // Apply promotion move with selected piece, defaulting to Queen if undefined
      const move = safeGameMutate((game) => {
        return game.move({
          from: fromSquare,
          to: toSquare,
          promotion: piece[1]?.toLowerCase() || 'q', // Default to Queen
        });
      });

      if (move && onPlayerMove) onPlayerMove(move, prevFen, game.fen());
      if (move && gameMode === 'timed') handleMoveTimerSwitch();
      resetArrows();
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
    if (move !== null && gameMode === 'timed') handleMoveTimerSwitch();
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
    if (isPaused) return;
    if (gameMode === 'timed' && isGameOver) {
      if (!statusMessage) showStatusMessage(game.turn() === 'w' ? 'Black wins!' : 'White wins!');
      return;
    }
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
    if (move !== null && gameMode === 'timed') handleMoveTimerSwitch();
    return move !== null;
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
    turn: game.turn(),
    initializeTimers,
    whiteTime,
    blackTime,
    getGameMode,
    whitePercentage,
    blackPercentage,
  };
};
