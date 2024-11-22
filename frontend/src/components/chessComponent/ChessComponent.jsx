import { Box, Button, Stack, Typography } from '@mui/material';
import { useWindowSize } from '@uidotdev/usehooks';
import { Chess } from 'chess.js';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChess } from '../../hooks/useChess';
import { formatUciMove } from '../../util/chessUtil';

import './ChessComponent.css';

export const ChessComponent = ({ onPlayerMove, lock, openDialog, fen, setBoardFen }) => {
  // Tracks moves with separate FEN states for the notation table
  const [notation, setNotation] = useState([]);
  const [isPaused, setIsPaused] = useState(false); // Tracks the pause/resume state
  const { height, width } = useWindowSize();
  const notationEndRef = useRef(null); // Reference to scroll to latest move

  const updateNotation = (move, fen, player) => {
    setNotation((prevNotation) => {
      const newNotation = [...prevNotation];
      if (player === 'user') {
        newNotation.push({ user: { san: move.san, fen }, bot: null });
      } else {
        newNotation[newNotation.length - 1].bot = { san: move.san, fen };
      }
      return newNotation;
    });
  };

  const fullOnPlayerMove = (move, prevFen, currFen) => {
    onPlayerMove(formatUciMove(move), prevFen);
    updateNotation(move, currFen, 'user');
  };

  const onBotMove = (move, _, currFen) => {
    updateNotation(move, currFen, 'bot');
  };

  const {
    position,
    onDrop,
    onPieceDragBegin,
    onPieceDragEnd,
    onSquareClick,
    onSquareRightClick,
    onPromotionPieceSelect,
    showPromotionDialog,
    optionSquares,
    rightClickedSquares,
    isGameOver,
    statusMessage,
    setGame,
    moveTo,
    resetGame,
  } = useChess({ onPlayerMove: fullOnPlayerMove, onBotMove, lock, isPaused });

  // Change the board state whenever a new FEN is submitted
  useEffect(() => {
    if (fen) {
      const newGame = new Chess(fen);
      setGame(newGame);
      setNotation([]); // Clear the move history

      if (isPaused) {
        setIsPaused(false);
      }
    }
  }, [fen]);

  useEffect(() => {
    // Scrolls to the latest move whenever a new move is added
    if (notationEndRef.current) {
      notationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notation]);

  function handleNotationClick(fen) {
    const newGame = new Chess(fen);
    setGame(newGame);
    setIsPaused(true); // Enter pause state whenever a move is clicked
  }

  function togglePauseResume() {
    if (isPaused) {
      // Resume: set to the latest FEN and enable moves
      const latestFEN = notation.length
        ? notation[notation.length - 1].bot?.fen || notation[notation.length - 1].user.fen
        : position;
      const newGame = new Chess(latestFEN);
      setGame(newGame);
      setIsPaused(false);
    } else {
      // Pause: disable moves
      setIsPaused(true);
    }
  }

  return (
    <Box className="chessboard-container">
      <Box className="chessboard-box">
        <Chessboard
          boardWidth={Math.min(height, width / 1.5) - 150} // Responsive board width
          position={position}
          onPieceDrop={onDrop}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          animationDuration={200}
          arePiecesDraggable={!isPaused} // Enable dragging only if not paused
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          promotionToSquare={moveTo}
          showPromotionDialog={showPromotionDialog}
          customBoardStyle={{
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
          customSquareStyles={{
            ...optionSquares,
            ...rightClickedSquares,
          }}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#EEEED2' }}
        />

        {isGameOver && (
          <Stack className="game-over-message">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {statusMessage}
            </Typography>
          </Stack>
        )}

        <Box className="reset-button">
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setBoardFen('');
              resetGame();
              setNotation([]);
              setIsPaused(false); // Reset to resume state
            }}
          >
            reset
          </Button>
          <Button variant="contained" size="large" onClick={openDialog}>
            Upload Chessboard Setup
          </Button>
        </Box>
      </Box>

      <Box className="notation-table-wrapper">
        <Typography variant="h6" gutterBottom>
          Move History
        </Typography>
        <Box className="notation-table">
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
            <div ref={notationEndRef} /> {/* Reference for scrolling */}
          </Stack>
        </Box>

        {/* Persistent Pause/Resume Button */}
        <Box className="pause-resume-button">
          <Button
            variant="contained"
            color={isPaused ? 'primary' : 'secondary'}
            onClick={togglePauseResume}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

ChessComponent.propTypes = {
  onPlayerMove: PropTypes.func,
  lock: PropTypes.bool.isRequired,
  openDialog: PropTypes.func.isRequired,
  fen: PropTypes.string,
  setBoardFen: PropTypes.func,
};
