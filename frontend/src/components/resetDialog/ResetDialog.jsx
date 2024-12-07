import { Checkbox, Divider, FormControlLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Fragment, useContext } from 'react';
import { useDialog } from '../../hooks/useDialog';
import { ChessContext } from '../../pages/ChessPage/ChessContext';
import { useConfig } from '../../hooks/useConfig';

export const ResetDialog = ({ onResetComplete }) => {
  const { isDialogOpen, openDialog, closeDialog } = useDialog();

  const { moveHistory, chat, config, updateConfigValue } = useContext(ChessContext);
  const { resetHistory } = moveHistory;
  const { resetChat } = chat;

  const onSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    if (formJson['chat-reset'] === 'on') {
      resetChat();
    }

    resetHistory();

    // Reset config to default values
    Object.keys(useConfig).forEach((key) => {
      updateConfigValue(key, useConfig[key]);
    });

    closeDialog();
    if (onResetComplete) {
      onResetComplete();
    }
  };

  return (
    <Fragment>
      <Button variant="contained" color="secondary" size="large" onClick={openDialog}>
        Reset
      </Button>
      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        PaperProps={{
          component: 'form',
          onSubmit,
        }}
      >
        <DialogTitle>Are you sure you want to reset?</DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            By clicking <strong>RESET</strong> you will reset the move history and the current game
            state. Resetting the chat will remove all messages, but is optional.
          </DialogContentText>
          <FormControlLabel
            sx={{ mt: 2 }}
            control={<Checkbox id="chat-reset" name="chat-reset" color="success" />}
            label="Reset chat"
          />
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={closeDialog} color="inherit" variant="contained">
            Cancel
          </Button>
          <Button type="submit" color="error" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};
