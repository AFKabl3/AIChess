import { Method } from './api';
import { request } from './request';

const ChessEndpoint = {
  EVALUATE_MOVE: '/evaluate_move',
  ANSWER_QUESTION: '/answer_question',
  SUGGEST_MOVE: '/suggest_move',
  SUGGEST_MOVE_WITH_EXPLANATION: '/suggest_move_with_explanation',
  GET_BOT_MOVE: '/get_bot_move',
};

/**
 * Evaluates a chess move for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @param {string} move The UCI notation of the move to evaluate.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `evaluation` (float): Numeric evaluation score for the move.
 *   - `feedback` (string): Descriptive feedback on the quality of the move.
 *  or rejects with an error message.
 */
export const evaluateMove = async (fen, move) =>
  request(ChessEndpoint.EVALUATE_MOVE, Method.POST, { fen, move });

/**
 * Answers a question about a given chess board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @param {string} question The question about the board position.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `answer` (string): Answer based on the provided board state.
 *  or rejects with an error message.
 */
export const answerChessQuestion = async (fen, question) =>
  request(ChessEndpoint.ANSWER_QUESTION, Method.POST, { fen, question });

/**
 * Gets the suggested move for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `move` (string): The best move in UCI notation.
 *  or rejects with an error message.
 */
export const getSuggestedMove = async (fen) =>
  request(ChessEndpoint.SUGGEST_MOVE, Method.POST, { fen });

/**
 * Gets the suggested move along with an explanation for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `move` (string): The best move in UCI notation.
 *   - `explanation` (string): Explanation for why this move is suggested.
 *  or rejects with an error message.
 */
export const getSuggestedMoveWithExplanation = async (fen) =>
  request(ChessEndpoint.SUGGEST_MOVE_WITH_EXPLANATION, Method.POST, { fen });

/**
 * Gets the bot's move for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @param {number} depth The depth to search for the best move.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *  - `bot_move` (string): The best move for the given depth.
 *  or rejects with an error message.
 */
export const getBotMove = async (fen, depth) =>
  request(ChessEndpoint.GET_BOT_MOVE, Method.POST, { fen, depth });
