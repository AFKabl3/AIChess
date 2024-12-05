#flask modules
from flask import jsonify, Flask
from flask_cors import CORS
from flask import request
#route_utils module
from . routes_utils import helper_functions as utils
#stockfish modules
from stockfish import Stockfish
from stockfish import StockfishException
#Assistant module
from .LLM_engine.main_coach import MainCoach


def create_main_app():

    app = Flask(__name__)
    CORS(app)


    stockfish_path = utils.get_stockfish_binary_path()
    stockfish = Stockfish(path=stockfish_path)
    coach = MainCoach()


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


        if not utils.is_valid_move(fen, move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid/illegal string move provided."
            }), 422

        try:
            stockfish.set_fen_position(fen)
            evaluation_fen_before = stockfish.get_evaluation().get('value', None)

            after_move_fen = utils.move_to_fen(fen, move)
            stockfish.set_fen_position(after_move_fen)
            evaluation_fen_after = stockfish.get_evaluation().get('value', None)

            #reset stockfish_parameters
            stockfish.reset_engine_parameters()

            if evaluation_fen_before  is None or evaluation_fen_after is None:
                raise StockfishException("no evaluation for the current fen")

            delta_evaluation = utils.delta_evaluation(fen, evaluation_fen_before, evaluation_fen_after)
            board_str = utils.get_board(after_move_fen)
            input = (board_str, move, delta_evaluation)
            try:
                response = coach.ask_move_feedback(input)
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

        player_made_move = utils.get_current_player(fen)
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
            stockfish.set_fen_position(fen)
            evaluation_fen_before = stockfish.get_evaluation().get('value', None)

            suggested_move = stockfish.get_best_move()
            suggested_move_fen = utils.move_to_fen(fen, suggested_move)
            stockfish.set_fen_position(suggested_move_fen)
            evaluation_fen_after = stockfish.get_evaluation().get('value', None)

            #reset stockfish_parameters
            stockfish.reset_engine_parameters()

            if evaluation_fen_before  is None or evaluation_fen_after is None:
                raise StockfishException("no evaluation for the current fen")

            delta_evaluation = utils.delta_evaluation(fen, evaluation_fen_before, evaluation_fen_after)
            board_str = utils.get_board(fen)
            input = (board_str, suggested_move, delta_evaluation)

            try:
                response = coach.ask_move_suggestion(input)

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

        current_player = utils.get_current_player(fen)
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

        if not utils.is_valid_question(question):
            return jsonify({
                "type": "invalid_question",
                "message": "Invalid question string provided."
            }), 422 # This will create an error if question is invalid

        try:
            stockfish.set_fen_position(fen)
            evaluation_fen = stockfish.get_evaluation().get('value', None)

            stockfish.reset_engine_parameters()
            if evaluation_fen is None:
                raise StockfishException("no evaluation for the current fen")

            try:
                # ask question to the LLM
                board_str = utils.get_board(fen)
                answer = coach.ask_chess_question(board_str, question, evaluation_fen)

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

        if not utils.is_valid_num(skill_level):
            return jsonify({
                "type": "invalid_skill_level",
                "message": "Invalid skill level provided."
            }), 422

        try:
            stockfish.set_fen_position(fen)
            stockfish.set_skill_level(int(skill_level))  # Ensure it's an integer
            bot_move = stockfish.get_best_move()

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
            stockfish.reset_engine_parameters()
            stockfish.set_fen_position(fen)
            suggested_move = stockfish.get_best_move()

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
