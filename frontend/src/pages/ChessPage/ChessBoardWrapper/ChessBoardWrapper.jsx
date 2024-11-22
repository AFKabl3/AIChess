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
    closeDialog();
  };

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
      </Box>
      <DialogComponent isOpen={isDialogOpen} onClose={closeDialog} onSubmit={handleFenSubmit} />
    </Box>
  );
};
