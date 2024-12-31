import {
  answerChessQuestion,
  evaluateMove,
  getBestMove,
  getBotMove,
  getMoveSuggestionWithEvaluation,
  getWinningPercentage,
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
  getWinningPercentage,
};
