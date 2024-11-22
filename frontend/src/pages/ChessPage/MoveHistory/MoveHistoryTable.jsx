import { Box, Button, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useRef } from 'react';
import { ChessContext } from '../ChessContext';

export const MoveHistoryTable = () => {
  const { chess, moveHistory } = useContext(ChessContext);

  const notationEndRef = useRef(null);
  const { position, setGame, gameFromFen } = chess;

  const { isPaused, setIsPaused, history } = moveHistory;

  useEffect(() => {
    // Scrolls to the latest move whenever a new move is added
    if (notationEndRef.current) {
      notationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  function handleNotationClick(fen) {
    const newGame = gameFromFen(fen);
    setGame(newGame);
    setIsPaused(true);
  }

  function togglePauseResume() {
    if (isPaused) {
      // Resume: set to the latest FEN and enable moves
      const latestFEN = history.length
        ? history[history.length - 1].bot?.fen || history[history.length - 1].user.fen
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
    <Box sx={{ bgcolor: 'blue', flexGrow: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Move History
      </Typography>
      <Box className="notation-table">
        <Stack spacing={1}>
          {history.map((movePair, index) => (
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
  );
};

MoveHistoryTable.propTypes = {};
