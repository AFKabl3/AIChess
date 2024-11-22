import { Box, Button } from '@mui/material';
import { useContext } from 'react';
import { ChessComponent } from '../../../components/chessComponent/ChessComponent';
import DialogComponent from '../../../components/dialogComponent/DialogComponent';
import { useDialog } from '../../../hooks/useDialog';
import { ChessContext } from '../ChessContext';

export const ChessBoardWrapper = () => {
  const { chess, moveHistory } = useContext(ChessContext);

  const { isDialogOpen, openDialog, closeDialog } = useDialog();

  const { resetGame } = chess;
  const { resetNotation, setIsPaused } = moveHistory;

  const handleFenSubmit = (fen) => {
    chess.setGame(chess.gameFromFen(fen));
    resetNotation();
    closeDialog();
  };

  return (
    <Box>
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
