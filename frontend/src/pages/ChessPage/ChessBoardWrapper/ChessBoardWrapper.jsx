import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { ChessComponent } from '../../../components/chessComponent/ChessComponent';
import DialogComponent from '../../../components/dialogComponent/DialogComponent';
import { InfoBox } from '../../../components/InfoBox/InfoBox';
import { ResetDialog } from '../../../components/resetDialog/ResetDialog';
import { useDialog } from '../../../hooks/useDialog';
import { ChessContext } from '../ChessContext';
import { ConfigBox } from '../Config/ConfigBox';
import { NewGameDialog } from '../../../components/newGameDialog/newGameDialog';
import { Timer } from '../../../components/timer/Timer';

export const ChessBoardWrapper = ({ settings }) => {
  const { chess, moveHistory, updateConfigValue } = useContext(ChessContext);

  const { isDialogOpen, openDialog, closeDialog } = useDialog();

  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState();
  const [selectedMinutes, setSelectedMinutes] = useState();
  const [selectedColor, setSelectedColor] = useState();

  const { resetHistory } = moveHistory;
  const { resetGame } = chess;
  const handleFenSubmit = (fen) => {
    const { loadGame } = chess;

    loadGame(fen);
    resetHistory();
    closeDialog();
  };

  const handleDialogData = ({ selectedMode, selectedColor, selectedMinutes, selectedSeconds }) => {
    setSelectedMode(selectedMode);
    setSelectedColor(selectedColor);
    setSelectedMinutes(selectedMinutes);
    resetGame();

    if (selectedMode === 'full-control') {
      updateConfigValue('fullControlMode', true);
      updateConfigValue('startedGame', true);
      updateConfigValue('selectedColor', 'w');
    } else if (selectedMode === 'versus-bot') {
      updateConfigValue('selectedColor', selectedColor);
      updateConfigValue('startedGame', true);
    } else {
      updateConfigValue('selectedColor', selectedColor);
      updateConfigValue('startedGame', true);
      const minutes = parseInt(selectedMinutes, 10);
      const seconds = parseInt(selectedSeconds, 10);
      if (selectedMode === 'timed') {
        chess.initializeTimers(minutes, seconds);
      }
    }
  };

  const { toggleFollowChat, toggleLLMUse } = settings;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        {/* TODO: Create system for selecting difficulty */}
        <InfoBox title="Bot" subtitle="(205)" image="/bot.png" />
        {selectedMode === 'timed' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Timer time={chess.whiteTime} isActive={chess.activePlayer === 'w'} color="white" />
            <Timer time={chess.blackTime} isActive={chess.activePlayer === 'b'} color="black" />
          </Box>
        )}
        <ConfigBox controls={{ toggleFollowChat, toggleLLMUse }} />
      </Box>
      <ChessComponent chess={chess} />
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', gap: 4, pt: 2 }}>
        <ResetDialog onResetComplete={() => setIsNewGameDialogOpen(true)} />
        <NewGameDialog
          onConfirm={handleDialogData}
          open={isNewGameDialogOpen}
          onClose={() => setIsNewGameDialogOpen(false)}
        />
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
