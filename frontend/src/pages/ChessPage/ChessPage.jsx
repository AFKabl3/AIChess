import { Box } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/api';
import { useChat } from '../../hooks/useChat';
import { useChess } from '../../hooks/useChess';
import { useMoveHistory } from '../../hooks/useMoveHistory';
import { formatUciMove } from '../../util/chessUtil';
import { Chat } from './Chat/Chat';
import { ChessBoardWrapper } from './ChessBoardWrapper/ChessBoardWrapper';
import { ChessContext } from './ChessContext';
import { MoveHistoryTable } from './MoveHistory/MoveHistoryTable';

export const ChessPage = () => {
  const [llmUse, setLLMUse] = useState(true);
  const [lock, setLock] = useState(false);

  const { messages, followChat, toggleFollowChat, sendMessage, addBotChat, modifyMessageText } =
    useChat();

  const moveHistory = useMoveHistory();
  const { isPaused, updateNotation } = moveHistory;

  const chess = useChess({
    onPlayerMove: (move, prevFen, currFen) => {
      onPlayerMove(formatUciMove(move), prevFen);
      updateNotation(move, currFen, 'user');
    },
    onBotMove: (move, _, currFen) => {
      updateNotation(move, currFen, 'bot');
    },
    lock,
    isPaused,
  });

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
    <ChessContext.Provider value={{ chess, moveHistory }}>
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
        <MoveHistoryTable />
        <ChessBoardWrapper />
        <Chat
          followChat={followChat}
          toggleFollowChat={toggleFollowChat}
          messages={messages}
          sendMessage={sendMessage}
          toggleLLMUse={() => setLLMUse(!llmUse)}
        />
      </Box>
    </ChessContext.Provider>
  );
};
