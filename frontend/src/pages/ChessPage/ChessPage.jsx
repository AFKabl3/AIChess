import { Box } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/api';
import { ChessComponent } from '../../components/chessComponent/ChessComponent';
import DialogComponent from '../../components/dialogComponent/DialogComponent';
import { Chat } from './Chat/Chat';
import './ChessPage.css';

const ChessPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [boardFen, setBoardFen] = useState('');

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleFenSubmit = (fen) => {
    setBoardFen('');
    // A timeout so the change can be recognised if the user uses the same FEN notation again
    setTimeout(() => {
      setBoardFen(fen);
    }, 0);
    closeDialog();
  };

  const [messages, setMessages] = useState([{ text: 'Welcome to the game chat!', isUser: false }]);
  const [followChat, setFollowChat] = useState(true);
  const [llmUse, setLLMUse] = useState(true);
  const [lock, setLock] = useState(false);

  const toggleFollowChat = () => setFollowChat(!followChat);
  const toggleLLMUse = () => setLLMUse(!llmUse);

  const sendMessage = (text, isUser) => {
    const index = messages.length;

    setMessages((prevMessages) => [...prevMessages, { text, isUser }]);

    return index;
  };

  const modifyMessageText = (index, text) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];

      newMessages[index].text = text;
      return newMessages;
    });
  };

  const sendUserChat = (text) => sendMessage(text, true);

  const addBotChat = (text) => sendMessage(text, false);

  /**
   * Handles the player's move by evaluating it and updating the chat with the result.
   *
   * @param {string} move - The move made by the player in standard algebraic notation.
   * @param {string} fen - The FEN (Forsyth-Edwards Notation) string representing the current board state.
   * @returns {Promise<void>} - A promise that resolves when the move evaluation is complete.
   */
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
    <Box>
      <ChessComponent
        lock={lock}
        onPlayerMove={onPlayerMove}
        openDialog={openDialog}
        fen={boardFen}
        setBoardFen={setBoardFen}
      />

      <Chat
        followChat={followChat}
        toggleFollowChat={toggleFollowChat}
        messages={messages}
        sendMessage={sendUserChat}
        toggleLLMUse={toggleLLMUse}
      />

      <DialogComponent isOpen={isDialogOpen} onClose={closeDialog} onSubmit={handleFenSubmit} />
    </Box>
  );
};

export default ChessPage;
