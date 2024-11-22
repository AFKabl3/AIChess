import { Box, Button, Stack, styled } from '@mui/material';
import { useContext, useEffect, useRef } from 'react';
import { ContainerTitle } from '../../../components/styledComponents/ContainerTitle';
import { SideContainer } from '../../../components/styledComponents/SideContainer';
import { ChessContext } from '../ChessContext';

const NotationLink = styled('span')({
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
  fontWeight: 'bold',
});

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
    <SideContainer
      sx={{
        flexGrow: 2,
        height: '100%',
        minWidth: '150px',
        maxWidth: '200px',
      }}
    >
      <ContainerTitle variant="h6" gutterBottom>
        Move History
      </ContainerTitle>
      <Box sx={{ p: 2, flex: 1 }}>
        <Stack spacing={1} sx={{ pl: 2, pr: 2 }}>
          {history.map((movePair, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <NotationLink onClick={() => handleNotationClick(movePair.user.fen)}>
                {`${index + 1}. ${movePair.user.san}`}
              </NotationLink>
              {movePair.bot && (
                <NotationLink onClick={() => handleNotationClick(movePair.bot.fen)}>
                  {movePair.bot.san}
                </NotationLink>
              )}
            </Box>
          ))}
          <div ref={notationEndRef} /> {/* Reference for scrolling */}
        </Stack>
      </Box>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color={isPaused ? 'primary' : 'secondary'}
          onClick={togglePauseResume}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </Box>
    </SideContainer>
  );
};

MoveHistoryTable.propTypes = {};