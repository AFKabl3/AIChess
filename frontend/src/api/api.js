import {
  answerChessQuestion,
  evaluateMove,
  getBestMove,
  getBotMove,
  getGameStatus,
  getMoveSuggestionWithEvaluation,
  getWinningPercentage,
  moreExplanation,
} from './chess';
import { example } from './example';

export const Method = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE',
  PUT: 'PUT',
  PATCH: 'PATCH',
};

export const api = {
  example,
  evaluateMove,
  getMoveSuggestionWithEvaluation,
  answerChessQuestion,
  getBotMove,
  getBestMove,
  moreExplanation,
  getWinningPercentage,
  getGameStatus,
};
