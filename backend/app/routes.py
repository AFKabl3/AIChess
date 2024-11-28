#flask modules
from flask import jsonify, Flask
from flask_cors import CORS
from flask import request
#route_utils module
from  routes_utils import helper_functions as utils
#stockfish modules
from stockfish import Stockfish
from stockfish import StockfishException
#Assistant module
from LLM_engine.main_coach import MainCoach


def create_main_app():

    app = Flask(__name__)
    CORS(app)


    stockfish_path = utils.get_stockfish_path()
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

        stockfish.set_fen_position()

        if not stockfish.is_move_correct(move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid move string provided."
            }), 422

        try:
            stockfish.set_position(move)
            evaluation = stockfish.get_evaluation()

        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500



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
