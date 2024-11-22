import { Box } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/api';
import DialogComponent from '../../components/dialogComponent/DialogComponent';
import { useChat } from '../../hooks/useChat';
import { useDialog } from '../../hooks/useDialog';
import { Chat } from './Chat/Chat';
import { ChessBoardWrapper } from './ChessBoardWrapper/ChessBoardWrapper';

export const ChessPage2 = () => {
  const [llmUse, setLLMUse] = useState(true);
  const [lock, setLock] = useState(false);

  // const { resetGame } = useChess();

  const { messages, followChat, toggleFollowChat, sendMessage, addBotChat, modifyMessageText } =
    useChat();

  const { isDialogOpen, openDialog, closeDialog } = useDialog();

  const handleFenSubmit = (fen) => {
    closeDialog();
  };

  const onPlayerMove = async (move, fen) => {
    if (!llmUse) return;

    const index = addBotChat(`You played ${move}. Evaluating the move ...`);

    setLock(true);
    try {
      const res = await api.evaluateMove(fen, move);
      const data = await res.json();

      modifyMessageText(index, `You played ${move}. ${data.feedback}`);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while evaluating the move.');

      modifyMessageText(index, 'An error occurred while evaluating the move.');
    }
    setLock(false);
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        height: '90%',
        width: '100%',
        gap: 3,
        p: 3,
      }}
    >
      <Box sx={{ bgcolor: 'blue', flexGrow: 2, height: '100%' }} />
      <ChessBoardWrapper lock={lock} onPlayerMove={onPlayerMove} openDialog={openDialog} />
      <Chat
        followChat={followChat}
        toggleFollowChat={toggleFollowChat}
        messages={messages}
        sendMessage={sendMessage}
        toggleLLMUse={() => setLLMUse(!llmUse)}
      />
      <DialogComponent isOpen={isDialogOpen} onClose={closeDialog} onSubmit={handleFenSubmit} />
    </Box>
  );
};
