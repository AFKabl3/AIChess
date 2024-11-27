import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { ChessComponent } from '../../../components/chessComponent/ChessComponent';
import DialogComponent from '../../../components/dialogComponent/DialogComponent';
import { InfoBox } from '../../../components/InfoBox/InfoBox';
import { ResetDialog } from '../../../components/resetDialog/ResetDialog';
import { useDialog } from '../../../hooks/useDialog';
import { ChessContext } from '../ChessContext';
import { ConfigBox } from '../Config/ConfigBox';

export const ChessBoardWrapper = ({ settings }) => {
  const { chess, moveHistory } = useContext(ChessContext);

  const { isDialogOpen, openDialog, closeDialog } = useDialog();

  const { resetHistory } = moveHistory;

  const handleFenSubmit = (fen) => {
    const { loadGame } = chess;

    loadGame(fen);
    resetHistory();
    closeDialog();
  };

  const { toggleFollowChat, toggleLLMUse } = settings;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        {/* TODO: Create system for selecting difficulty */}
        <InfoBox title="Bot" subtitle="(205)" image="/bot.png" />
        <ConfigBox controls={{ toggleFollowChat, toggleLLMUse }} />
      </Box>
      <ChessComponent chess={chess} />
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', gap: 4, pt: 2 }}>
        <ResetDialog />
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
