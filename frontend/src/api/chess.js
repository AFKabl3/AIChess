import { Method } from './api';
import { request, requestWithErrorToast } from './request';

const ChessEndpoint = {
  EVALUATE_MOVE: '/evaluate_move',
  MOVE_SUGGESTION_WITH_EVALUATION: '/get_move_suggestion_with_evaluation',
  ANSWER_QUESTION: '/answer_question',
  GET_BOT_MOVE: '/get_bot_move',
  GET_BEST_MOVE: '/get_best_move',
  MORE_EXPLANATION: '/more_explanation',
  GET_WINNING_PERCENTAGE: '/get_winning_percentage',
  GET_GAME_STATUS: '/get_game_status',
};

const errorMessages = {
  EVALUATE_MOVE: 'An error occurred while evaluating the move.',
  MOVE_SUGGESTION_WITH_EVALUATION: 'An error occurred while getting the move suggestion.',
  ANSWER_QUESTION: 'An error occurred while answering the question.',
  GET_BOT_MOVE: 'An error occurred while getting the bot move.',
  GET_BEST_MOVE: 'An error occurred while getting the best move.',
  GET_WINNING_PERCENTAGE: 'An error occurred while getting the winning percentage.',
  GET_GAME_STATUS: 'An error occurred while getting the game status.',
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
  requestWithErrorToast(
    ChessEndpoint.EVALUATE_MOVE,
    Method.POST,
    { fen, move },
    {},
    errorMessages.EVALUATE_MOVE
  );

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
  requestWithErrorToast(
    ChessEndpoint.MOVE_SUGGESTION_WITH_EVALUATION,
    Method.POST,
    { fen },
    {},
    errorMessages.MOVE_SUGGESTION_WITH_EVALUATION
  );

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
  requestWithErrorToast(
    ChessEndpoint.ANSWER_QUESTION,
    Method.POST,
    { fen, question },
    {},
    errorMessages.ANSWER_QUESTION
  );

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
  requestWithErrorToast(
    ChessEndpoint.GET_BOT_MOVE,
    Method.POST,
    { fen, skill_level },
    {},
    errorMessages.GET_BOT_MOVE
  );

/**
 * Gets the best move for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `suggested_move` (string): The best move in UCI notation.
 *  or rejects with an error message.
 */
export const getBestMove = async (fen) =>
  requestWithErrorToast(
    ChessEndpoint.GET_BEST_MOVE,
    Method.POST,
    { fen },
    {},
    errorMessages.GET_BEST_MOVE
  );

/**
 * Gives a more detailed explanation from a previous question
 *
 * @param {string} question Previous question.
 * @param {string} first_answer Previous response.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `more_explanation` (string): A better explanation.
 *  or rejects with an error message.
 */
export const moreExplanation = async (question, first_answer) =>
  request(ChessEndpoint.MORE_EXPLANATION, Method.POST, { question, first_answer });

/** Gets the winning percentage for a given board position and a move.
 *
 * @param {string} fen The FEN string representing the board state.
 * @param {string} move The UCI notation of the move to evaluate.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `current_player` (string): The player to move ("w" or "b").
 *   - `percentage` (float): Percentage of winning of the `current_player`.
 *  or rejects with an error message.
 */
export const getWinningPercentage = async (fen) =>
  requestWithErrorToast(
    ChessEndpoint.GET_WINNING_PERCENTAGE,
    Method.POST,
    { fen },
    {},
    errorMessages.GET_WINNING_PERCENTAGE
  );

/**
 * Gets the current game status for a given board position.
 *
 * @param {string} fen The FEN string representing the board state.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - `answer` (string): The current status of the game.
 *  or rejects with an error message.
 */
export const getGameStatus = async (fen) =>
  requestWithErrorToast(
    ChessEndpoint.GET_GAME_STATUS,
    Method.POST,
    { fen },
    {},
    errorMessages.GET_GAME_STATUS
  );
