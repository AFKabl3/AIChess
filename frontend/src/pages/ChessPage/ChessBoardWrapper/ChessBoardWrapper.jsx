import { Box, Button, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { ChessComponent } from '../../../components/chessComponent/ChessComponent';
import { useChess } from '../../../hooks/useChess';
import { useMoveHistory } from '../../../hooks/useMoveHistory';
import { formatUciMove } from '../../../util/chessUtil';

export const ChessBoardWrapper = ({ onPlayerMove, lock, openDialog }) => {
  const { fen, isPaused, setIsPaused, updateNotation, resetNotation, moveHistory } =
    useMoveHistory();

  const notationEndRef = useRef(null);

  const fullOnPlayerMove = (move, prevFen, currFen) => {
    onPlayerMove(formatUciMove(move), prevFen);
    updateNotation(move, currFen, 'user');
  };

  const onBotMove = (move, _, currFen) => {
    updateNotation(move, currFen, 'bot');
  };

  const chess = useChess({ onPlayerMove: fullOnPlayerMove, onBotMove, lock, isPaused });
  const { position, setGame, gameFromFen, resetGame } = chess;

  // Change the board state whenever a new FEN is submitted
  useEffect(() => {
    if (fen) {
      const newGame = gameFromFen(fen);
      setGame(newGame);
      resetNotation();

      if (isPaused) {
        setIsPaused(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  useEffect(() => {
    // Scrolls to the latest move whenever a new move is added
    if (notationEndRef.current) {
      notationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [moveHistory]);

  function handleNotationClick(fen) {
    const newGame = gameFromFen(fen);
    setGame(newGame);
    setIsPaused(true); // Enter pause state whenever a move is clicked
  }

  function togglePauseResume() {
    if (isPaused) {
      // Resume: set to the latest FEN and enable moves
      const latestFEN = moveHistory.length
        ? moveHistory[moveHistory.length - 1].bot?.fen ||
          moveHistory[moveHistory.length - 1].user.fen
        : position;
      const newGame = gameFromFen(latestFEN);
      setGame(newGame);
      setIsPaused(false);
    } else {
      // Pause: disable moves
      setIsPaused(true);
    }
  }

  return (
    <Box>
      <ChessComponent chess={chess} />
      <Box>
        <Box className="reset-button">
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              resetGame();
              resetNotation();
              setIsPaused(false); // Reset to resume state
            }}
          >
            reset
          </Button>
          <Button variant="contained" size="large" onClick={openDialog}>
            Upload Chessboard Setup
          </Button>
        </Box>

        <Box className="notation-table-wrapper">
          <Typography variant="h6" gutterBottom>
            Move History
          </Typography>
          <Box className="notation-table">
            <Stack spacing={1}>
              {moveHistory.map((movePair, index) => (
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
    </Box>
  );
};

ChessBoardWrapper.propTypes = {
  onPlayerMove: PropTypes.func.isRequired,
  lock: PropTypes.bool.isRequired,
  openDialog: PropTypes.func.isRequired,
};
