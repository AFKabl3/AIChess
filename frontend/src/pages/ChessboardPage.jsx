import { React, useState, useEffect } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import "./ChessboardPage.css";

export const ChessboardPage = () => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Tracks moves with separate FEN states for the notation table
  const [notation, setNotation] = useState([]);
  const [currentFEN, setCurrentFEN] = useState(""); // Tracks the current FEN state displayed
  const [isPaused, setIsPaused] = useState(false);  // Tracks the pause/resume state

  useEffect(() => {
    if (game.game_over()) {
      const winner = game.in_checkmate() ? (game.turn() === "w" ? "Black wins!" : "White wins!") : "Draw!";
      setStatusMessage(winner);
      setIsGameOver(true);
    } else if (game.in_check()) {
      const kingPos = getKingPosition(game);
      setOptionSquares({ [kingPos]: { backgroundColor: "rgba(255, 0, 0, 0.5)" } });
    } else {
      setOptionSquares({});
    }
  }, [game]);

  useEffect(() => {
    setCurrentFEN(game.fen()); // Update current FEN whenever the game changes
  }, [game]);

  function getKingPosition(game) {
    const kingPosition = []
      .concat(...game.board())
      .map((piece, index) => {
        if (piece !== null && piece.type === "k" && piece.color === game.turn()) {
          return index;
        }
      })
      .filter(Number.isInteger);

    if (kingPosition.length > 0) {
      const pieceIndex = kingPosition[0];
      const row = "abcdefgh"[pieceIndex % 8];
      const column = Math.ceil((64 - pieceIndex) / 8);
      return row + column;
    }
    return null;
  }

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function getMoveOptions(square) {
    const moves = game.moves({ square, verbose: true });
    const newSquares = {};
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });

    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square) {
    if (isPaused) return; // Disable piece movement if game is paused

    setRightClickedSquares({});
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    if (!moveTo) {
      const moves = game.moves({ moveFrom, verbose: true });
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      setMoveTo(square);

      if (
        (foundMove.color === "w" && foundMove.piece === "p" && square[1] === "8") ||
        (foundMove.color === "b" && foundMove.piece === "p" && square[1] === "1")
      ) {
        setShowPromotionDialog(true);
        return;
      }

      const gameCopy = { ...game };
      let move_UCI_notation = moveFrom + square;
      const move = gameCopy.move(move_UCI_notation, { sloppy: true });

      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      updateNotation(move, "user");
      setGame(gameCopy);
      setTimeout(makeRandomMove, 300);
      setMoveFrom("");
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  function updateNotation(move, player) {
    setNotation((prevNotation) => {
      const newNotation = [...prevNotation];
      const fen = game.fen();
      if (player === "user") {
        newNotation.push({ user: { san: move.san, fen }, bot: null });
      } else {
        newNotation[newNotation.length - 1].bot = { san: move.san, fen };
      }
      return newNotation;
    });
  }

  function onPromotionPieceSelect(piece) {
    if (piece) {
      const gameCopy = { ...game };
      gameCopy.move({ from: moveFrom, to: moveTo, promotion: piece[1].toLowerCase() ?? "q" });
      setGame(gameCopy);
      updateNotation({ san: `${moveFrom}${moveTo}${piece}` }, "user");
      setTimeout(makeRandomMove, 300);
    }
    setMoveFrom("");
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return;
  }

  function onSquareRightClick(square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
        ? undefined
        : { backgroundColor: colour },
    });
  }

  function makeRandomMove() {
    const possibleMove = game.moves();
    if (game.game_over() || game.in_draw() || possibleMove.length === 0) return;
    const randomIndex = Math.floor(Math.random() * possibleMove.length);
    const move = game.move(possibleMove[randomIndex]);
    if (move) updateNotation(move, "bot");
    setGame(new Chess(game.fen()));
  }

  function onDrop(source, target) {
    if (isPaused) return false; // Disable drop if game is paused

    let move = null;
    safeGameMutate((game) => {
      move = game.move({ from: source, to: target, promotion: "q" });
    });
    if (move == null) return false;
    updateNotation(move, "user");
    setTimeout(makeRandomMove, 200);
    return true;
  }

  function handleNotationClick(fen) {
    const newGame = new Chess(fen);
    setGame(newGame);
    setCurrentFEN(fen); 
    setIsPaused(true); // Enter pause state whenever a move is clicked
  }

  function togglePauseResume() {
    if (isPaused) {
      // Resume: set to the latest FEN and enable moves
      const latestFEN = notation.length ? notation[notation.length - 1].bot?.fen || notation[notation.length - 1].user.fen : game.fen();
      const newGame = new Chess(latestFEN);
      setGame(newGame);
      setIsPaused(false); 
    } else {
      // Pause: disable moves
      setIsPaused(true);
    }
  }

  return (
    <Container className="chessboard-container">
      <Box className="chessboard-box">
        <Chessboard
          className="customBoardStyle"
          position={game.fen()}
          onPieceDrop={isPaused ? () => false : onDrop} // Disable piece drop in paused state
          animationDuration={200}
          arePiecesDraggable={!isPaused} // Enable dragging only if not paused
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          promotionToSquare={moveTo}
          showPromotionDialog={showPromotionDialog}
          customBoardStyle={{
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{ ...moveSquares, ...optionSquares, ...rightClickedSquares }}
          customDarkSquareStyle={{ backgroundColor: "#769656" }}
          customLightSquareStyle={{ backgroundColor: "#EEEED2" }}
        />

        {isGameOver && (
          <Stack className="game-over-message">
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {statusMessage}
            </Typography>
          </Stack>
        )}

        <Box className="reset-button">
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              safeGameMutate((game) => {
                game.reset();
              });
              setMoveSquares({});
              setOptionSquares({});
              setRightClickedSquares({});
              setStatusMessage("");
              setIsGameOver(false);
              setNotation([]);
              setCurrentFEN(game.fen());
              setIsPaused(false); // Reset to resume state
            }}
          >
            reset
          </Button>
        </Box>
      </Box>

      <Box className="notation-table">
        <Typography variant="h6" gutterBottom>
          Notation Table
        </Typography>
        <Stack spacing={1}>
          {notation.map((movePair, index) => (
            <Typography key={index} className="notation-item">
              <span
                className="notation-move clickable"
                onClick={() => handleNotationClick(movePair.user.fen)}
              >
                {`${index + 1}. ${movePair.user.san}`}
              </span>
              {movePair.bot && (
                <span
                  className="notation-move bot-move clickable"
                  onClick={() => handleNotationClick(movePair.bot.fen)}
                >
                  {movePair.bot.san}
                </span>
              )}
            </Typography>
          ))}
        </Stack>

        {/* Pause/Resume Button */}
        <Button
          variant="contained"
          color={isPaused ? "primary" : "secondary"}
          className="pause-resume-button"
          onClick={togglePauseResume}
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </Box>
    </Container>
  );
};
