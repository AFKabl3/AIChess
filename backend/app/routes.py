#flask modules
from flask import jsonify, Flask
from flask_cors import CORS
from flask import request

#stockfish modules
from .Stockfish_engine import StockfishEngine
from .Stockfish_engine import utils as stockfish_utils
from stockfish import StockfishException

#Assistant module
from .LLM_engine import MainCoach
from .LLM_engine import utils as llm_utils

def create_main_app():

    app = Flask(__name__)
    CORS(app)

    #stockfish instance creation
    stockfish_path = stockfish_utils.get_stockfish_binary_path()
    stockfish = StockfishEngine(path=stockfish_path)

    #main coach instance creation
    api_key = llm_utils.get_llm_api()
    coach = MainCoach(api_key=api_key)


    @app.route('/evaluate_move', methods=['POST'])
    def evaluate_move():
        data = request.get_json()
        fen = data.get("fen")
        move = data.get("move")

        # Validate FEN and move data
        if not fen or not move:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'fen' and 'move' fields are required."
            }), 400

        if not stockfish.is_fen_valid(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422  # This will create an error if FEN is invalid


        if not stockfish.is_move_valid(fen, move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid/illegal string move provided."
            }), 422

        try:
            # evaluation of the move made by the user
            delta_evaluation = stockfish.get_move_evaluation(fen, move)

            #reset stockfish_parameters
            stockfish.reset_engine_parameters()

            if delta_evaluation is None:
                raise StockfishException("no evaluation for the current fen")

            try:
                fen_after_move = stockfish_utils.from_move_to_fen(fen, move)
                board_str = stockfish_utils.get_string_board(fen_after_move)
                ask_input = {
                    "board": board_str,
                    "move": move,
                    "delta_evaluation": delta_evaluation
                }

                response = coach.ask_move_feedback(ask_input)
            except Exception as e:
                return jsonify({
                    "type": "llm_error",
                    "message": f"Failed to get a response from the LLM: {str(e)}"
                }), 500

        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": f"Failed to get a response from the stockfish: {str(e)}"
            }), 500

        player_made_move = stockfish_utils.get_current_player(fen)
        return jsonify({
            "player_made_move": player_made_move,
            "feedback": response,
        }), 200

    @app.route('/get_move_suggestion_with_evaluation', methods=['POST'])
    def get_move_suggestion_with_evaluation():
        data = request.get_json()
        fen = data.get("fen")

        if not fen:
            return jsonify({
                "type": "invalid_request",
                "message": "'fen' fields is required."
            }), 400

        if not stockfish.is_fen_valid(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422  # This will create an error if FEN is invalid

        try:
            # obtain from stockfish the best move
            suggested_move = stockfish.get_move_suggestion(fen)

            # calculate the evaluation of the move
            delta_evaluation = stockfish.get_move_evaluation(fen, suggested_move)

            #reset stockfish_parameters
            stockfish.reset_engine_parameters()

            if delta_evaluation  is None:
                raise StockfishException("no evaluation for the current fen")

            try:
                board_str = stockfish_utils.get_string_board(fen)
                ask_input = {
                    "board": board_str,
                    "move": suggested_move,
                    "delta_evaluation": delta_evaluation
                }

                response = coach.ask_move_suggestion(ask_input)

            except Exception as e:
                return jsonify({
                    "type": "llm_error",
                    "message": f"Failed to get a response from the LLM: {str(e)}"
                }), 500

        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": f"Failed to get a response from the stockfish: {str(e)}"
            }), 500

        current_player = stockfish_utils.get_current_player(fen)
        return jsonify({
            "current_player": current_player,
            "suggested_move": suggested_move,
            "suggestion": response,
        }), 200


    @app.route('/answer_question', methods=['POST'])
    def answer_question():
        data = request.get_json()
        fen = data.get("fen")
        question = data.get("question")

        if not fen or not question:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'fen' and 'question' fields are required."
            }), 400

        if not stockfish.is_fen_valid(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422  # This will create an error if FEN is invalid

        if not llm_utils.is_question_valid(question):
            return jsonify({
                "type": "invalid_question",
                "message": "Invalid question string provided."
            }), 422 # This will create an error if question is invalid

        try:
            evaluation = stockfish.get_board_evaluation(fen)

            # reset stockfish parameters
            stockfish.reset_engine_parameters()

            if evaluation is None:
                raise StockfishException("no evaluation for the current fen")

            try:
                board_str = stockfish_utils.get_string_board(fen)
                ask_input = {
                    "board": board_str,
                    "question": question,
                    "evaluation": evaluation
                }

                answer = coach.ask_chess_question(ask_input)

            except Exception as e:
                return jsonify({
                    "type": "llm_error",
                    "message": f"Failed to get a response from the LLM: {str(e)}"
                }), 500

        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": f"Failed to get a response from the stockfish: {str(e)}"
            }), 500

            # Response to client
        return jsonify({
            "answer": answer
        }), 200


    @app.route('/get_bot_move', methods=['POST'])
    def get_bot_move():
        data = request.get_json()
        fen = data.get("fen")
        skill_level = data.get("skill_level")

        if not fen or not skill_level:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'fen' and 'skill_level' fields are required."
            }), 400

        if not stockfish.is_fen_valid(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422

        if not stockfish_utils.is_skill_level_valid(skill_level):
            return jsonify({
                "type": "invalid_skill_level",
                "message": "Invalid skill level provided."
            }), 422

        try:
            # obtain from stockfish the bot move modifying the stockfish skill level
            bot_move = stockfish.get_bot_move(fen, skill_level)

            # Reset stockfish parameters
            stockfish.reset_engine_parameters()

        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": f"Failed to get a response from the stockfish: {str(e)}"
            }), 500

        return jsonify({
                "bot_move": bot_move
            }), 200


    @app.route('/get_best_move', methods=['POST'])
    def get_best_move():

        data = request.get_json()
        fen = data.get("fen")

        if not fen:
            return jsonify({
                "type": "invalid_request",
                "message": "'fen' field is required."
            }), 400

        if not stockfish.is_fen_valid(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422  # This will create an error if FEN is invalid

        try:
            # obtain from stockfish the best move
            suggested_move = stockfish.get_move_suggestion(fen)

            #reset stockfish_parameters
            stockfish.reset_engine_parameters()

        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": f"Failed to get a response from the stockfish: {str(e)}"
            }), 500

        return jsonify({
            "suggested_move": suggested_move
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "type": "not_found",
            "message": f"The requested resource was not found: : {str(error)}"
        }), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "type": "internal_server_error",
            "message": f"An unexpected error occurred: : {str(error)} "
        }), 500

    return app
