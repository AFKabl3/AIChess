#flask modules
from AIChess.backend.app.routes_utils.helper_functions import delta_evaluation
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

        finally:
            player_made_move = utils.get_current_player(fen)
            return jsonify({
                "player_made_move": player_made_move,
                "feedback": response,
            }), 200

    @app.route('/suggest_move', methods=['POST'])
    def move_suggestion():
        data = request.get_json()
        fen = data.get("fen")










    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "type": "not_found",
            "message": "The requested resource was not found."
        }), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "type": "internal_server_error",
            "message": "An unexpected error occurred."
        }), 500

    return app
