import {
  answerChessQuestion,
  evaluateMove,
  getBestMove,
  getBotMove,
  getMoveSuggestionWithEvaluation,
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
};
