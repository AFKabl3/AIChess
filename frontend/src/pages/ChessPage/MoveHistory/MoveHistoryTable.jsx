import { Box, Button, Stack, styled } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
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
  const { chess, moveHistory, config } = useContext(ChessContext);
  const { position, loadGame } = chess;
  const {
    isPaused,
    setIsPaused,
    history,
    savedFEN,
    saveFEN,
    resetSavedFEN,
    resetToFEN,
    undoLastMove,
  } = moveHistory;

  const notationEndRef = useRef(null);
  const [saveMode, setSaveMode] = useState(true);

  useEffect(() => {
    if (notationEndRef.current) {
      notationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  function handleNotationClick(fen) {
    loadGame(fen);
    setIsPaused(true);
  }

  function togglePauseResume() {
    if (isPaused) {
      const latestFEN = history.length
        ? history[history.length - 1].bot?.fen || history[history.length - 1].user.fen
        : position;
      loadGame(latestFEN);
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  }

  function handleSaveOrLoad() {
    if (saveMode) {
      saveFEN(position);
      setSaveMode(false);
    } else if (savedFEN) {
      loadGame(savedFEN);
      resetToFEN(savedFEN);
    }
  }

  function handleResetSave() {
    resetSavedFEN();
    setSaveMode(true);
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
      <Box sx={{ p: 1, flex: 1, minHeight: 0, overflowY: 'auto', scrollbarGutter: 'stable' }}>
        <Stack spacing={1} sx={{ pl: 2, pr: 2 }}>
          {history.map((movePair, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor:
                  movePair.user?.fen === savedFEN || movePair.bot?.fen === savedFEN
                    ? 'rgba(0, 255, 0, 0.2)'
                    : 'transparent',
                borderRadius: '4px',
                padding: '4px',
              }}
            >
              <NotationLink onClick={() => handleNotationClick(movePair.user.fen)}>
                {config.selectedColor === 'w' ? 
                (movePair.user ? `${index + 1}. ${movePair.user.san}` : ``) : 
                (movePair.bot ? `${index + 1}. ${movePair.bot.san}` : ``)}
              </NotationLink>
              <NotationLink onClick={() => handleNotationClick(movePair.bot.fen)}>
                {config.selectedColor === 'w' ? 
                (movePair.bot ? movePair.bot.san : ``) : 
                (movePair.user ? movePair.user.san : ``)}
              </NotationLink>
            </Box>
          ))}
          <div ref={notationEndRef} />
        </Stack>
      </Box>

      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
          minHeight: '50px',
        }}
      >
        <Button
          variant="contained"
          color={isPaused ? 'primary' : 'secondary'}
          onClick={togglePauseResume}
          sx={{
            flex: 1,
            backgroundColor: isPaused ? 'primary.main' : 'secondary.main',
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => {
            undoLastMove();
            const fen =
              history.length >= 2 ? history[history.length - 2].bot?.fen : chess.savedFEN;
            loadGame(fen);
          }}
          disabled={!history.length || savedFEN === position || isPaused}
          sx={{
            flex: 1,
            backgroundColor: 'warning.main',
          }}
        >
          Undo
        </Button>
      </Box>

      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="error"
          onClick={handleResetSave}
          disabled={!savedFEN || isPaused}
          sx={{
            flex: 1,
            backgroundColor: 'error.main',
          }}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          color={isPaused ? 'secondary' : 'success'}
          onClick={handleSaveOrLoad}
          disabled={
            isPaused || position === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
          }
          sx={{
            flex: 1,
            backgroundColor: isPaused ? 'secondary.main' : 'success.main',
          }}
        >
          {saveMode ? 'Save' : 'Load'}
        </Button>
      </Box>
    </SideContainer>
  );
};

MoveHistoryTable.propTypes = {};
