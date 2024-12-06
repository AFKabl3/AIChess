import { Method } from './api';
import { request } from './request';

const ChessEndpoint = {
  EVALUATE_MOVE: '/evaluate_move',
  MOVE_SUGGESTION_WITH_EVALUATION: '/get_move_suggestion_with_evaluation',
  ANSWER_QUESTION: '/answer_question',
  GET_BOT_MOVE: '/get_bot_move',
  GET_BEST_MOVE: '/get_best_move',
};

/**
 * Evaluates a chess move for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @param {string} move The UCI notation of the move to evaluate.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `player_made_move` (string): The player who made the move ("w" or "b").
 *   - `feedback` (string): Feedback on the quality of the move.
 *  or rejects with an error message.
 */
export const evaluateMove = async (fen, move) =>
  request(ChessEndpoint.EVALUATE_MOVE, Method.POST, { fen, move });

/**
 * Gets a suggested move along with its evaluation for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `current_player` (string): The player to move ("w" or "b").
 *   - `suggested_move` (string): The best move in UCI notation.
 *   - `suggestion` (string): Feedback or explanation for the move.
 *  or rejects with an error message.
 */
export const getMoveSuggestionWithEvaluation = async (fen) =>
  request(ChessEndpoint.MOVE_SUGGESTION_WITH_EVALUATION, Method.POST, { fen });

/**
 * Answers a question about a given chess board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @param {string} question The question about the board position.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `answer` (string): The answer to the question based on the board state.
 *  or rejects with an error message.
 */
export const answerChessQuestion = async (fen, question) =>
  request(ChessEndpoint.ANSWER_QUESTION, Method.POST, { fen, question });

/**
 * Gets the bot's move for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @param {number} skill_level The skill level of the bot.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `bot_move` (string): The best move for the bot at the given skill level.
 *  or rejects with an error message.
 */
export const getBotMove = async (fen, skill_level) =>
  request(ChessEndpoint.GET_BOT_MOVE, Method.POST, { fen, skill_level });

/**
 * Gets the best move for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `suggested_move` (string): The best move in UCI notation.
 *  or rejects with an error message.
 */
export const getBestMove = async (fen) =>
  request(ChessEndpoint.GET_BEST_MOVE, Method.POST, { fen });
