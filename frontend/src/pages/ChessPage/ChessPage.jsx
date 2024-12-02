import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/api';
import { useChat } from '../../hooks/useChat';
import { useChess } from '../../hooks/useChess';
import { useConfig } from '../../hooks/useConfig';
import { useMoveHistory } from '../../hooks/useMoveHistory';
import { formatUciMove, parseArrow } from '../../util/chessUtil';
import { waitForResponseToast } from '../../util/toasts';
import { Chat } from './Chat/Chat';
import { ChessBoardWrapper } from './ChessBoardWrapper/ChessBoardWrapper';
import { ChessContext } from './ChessContext';
import { MoveHistoryTable } from './MoveHistory/MoveHistoryTable';
import ColorSelection from '../../components/colorSelection/ColorSelection';

export const ChessPage = () => {
  const [llmUse, setLLMUse] = useState(true);
  const [lock, setLock] = useState(false);
  //const [config, updateConfigValue] = useConfig();
  const [config, setConfigValue] = useConfig();
  const [startedGame, setStartedGame] = useState(false);

  const chat = useChat();
  const { messages, followChat, toggleFollowChat, sendUserChat, addBotChat } = chat;

  const moveHistory = useMoveHistory();
  const { isPaused, updateHistory } = moveHistory;

  const chess = useChess({
    onPlayerMove: (move, prevFen, currFen) => {
      onPlayerMove(formatUciMove(move), prevFen);
      updateHistory(move, currFen, 'user');
    },
    onBotMove: (move, _, currFen) => {
      updateHistory(move, currFen, 'bot');
    },
    lock,
    isPaused,
    config,
    startedGame, 
    setStartedGame,
  });

  const { position, addArrow } = chess;

  const onPlayerMove = async (move, fen) => {
    if (!llmUse) return;

    if (lock) {
      waitForResponseToast();
      return;
    }

    const modifyText = addBotChat(`You played ${move}. Evaluating the move ...`);

    setLock(true);
    try {
      const res = await api.evaluateMove(fen, move);
      const data = await res.json();

      modifyText(`You played ${move}. ${data.feedback}`);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while evaluating the move.');

      modifyText('An error occurred while evaluating the move.');
    }
    setLock(false);
  };

  const onSuggestionRequest = async () => {
    if (lock) {
      waitForResponseToast();
      return;
    }

    const modifyText = addBotChat('Suggesting a move ...');

    setLock(true);
    try {
      const res = await api.getSuggestedMove(position);
      const data = await res.json();

      modifyText(`${data.suggestion}.`);
      addArrow(parseArrow(data.suggested_move));
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while suggesting a move.');

      modifyText('An error occurred while suggesting a move.');
    }
    setLock(false);
  };

  const onQuestionAsked = async (question) => {
    if (lock) {
      waitForResponseToast();
    }

    sendUserChat(question);

    const addResponseFunc = addBotChat('Waiting for response ...', true);

    setLock(true);
    try {
      const res = await api.answerChessQuestion(position, question);
      const data = await res.json();

      addResponseFunc(data.answer);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while waiting for an answer.');

      addResponseFunc('An error occurred while waiting for an answer.');
    }
    setLock(false);
  };

  const commands = [
    { text: 'Suggest a Move', command: onSuggestionRequest },
    {
      text: 'Explain game status',
      command: () => console.warn('This command is not implemented yet.'),
      disabled: true,
    },
  ];
  /*
  const startGame = () => {
    if (config.selectedColor !== 'undefined') {
      console.log("color ChessPage: ", config.selectedColor);
    }
      };
    */

  useEffect (() => {
    setConfigValue('startedGame', startedGame);
    console.log("ChessPage config: ", config);
    console.log('ChessPage startedGame', startedGame);
  }, [startedGame, setStartedGame]);
      
  
  
  if (!startedGame) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <h1>Select Your Color</h1>
        <ColorSelection startedGame={startedGame} setStartedGame={setStartedGame}/>
      </Box>
    );
  }

  return (
    <ChessContext.Provider value={{ chess, moveHistory, config, setConfigValue, chat }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          height: '90%',
          width: '100%',
          gap: 4,
          p: 3,
        }}
      >
        <MoveHistoryTable undoLastMove={moveHistory.undoLastMove} />
        <ChessBoardWrapper
          settings={{ toggleFollowChat, toggleLLMUse: () => setLLMUse(!llmUse) }}
        />
        <Chat
          followChat={followChat}
          messages={messages}
          sendMessage={onQuestionAsked}
          commands={commands}
        />
      </Box>
    </ChessContext.Provider>
  );
};
