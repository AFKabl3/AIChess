import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { ChessComponent } from '../../../components/chessComponent/ChessComponent';
import DialogComponent from '../../../components/dialogComponent/DialogComponent';
import { useDialog } from '../../../hooks/useDialog';
import { ChessContext } from '../ChessContext';
import { ConfigBox } from '../Config/ConfigBox';

export const ChessBoardWrapper = ({ settings }) => {
  const { chess, moveHistory } = useContext(ChessContext);

  const { isDialogOpen, openDialog, closeDialog } = useDialog();

  const { resetGame } = chess;
  const { resetNotation, setIsPaused } = moveHistory;

  const handleFenSubmit = (fen) => {
    chess.setGame(chess.gameFromFen(fen));
    resetNotation();
    closeDialog();
  };

  const { toggleFollowChat, toggleLLMUse } = settings;

  return (
    <Box>
      <ConfigBox controls={{ toggleFollowChat, toggleLLMUse }} />
      <ChessComponent chess={chess} />
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', gap: 4, pt: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => {
            resetGame();
            resetNotation();
            setIsPaused(false); // Reset to resume state
          }}
        >
          reset
        </Button>
        <Button variant="contained" color="secondary" size="large" onClick={openDialog}>
          Upload Chessboard Setup
        </Button>
      </Box>
      <DialogComponent isOpen={isDialogOpen} onClose={closeDialog} onSubmit={handleFenSubmit} />
    </Box>
  );
};

ChessBoardWrapper.propTypes = {
  settings: PropTypes.object.isRequired,
};
