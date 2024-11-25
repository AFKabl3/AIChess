from flask import jsonify, Flask
from flask_cors import CORS
from .LLM_engine import helper_functions as check
import chess
from .stockfish_api import StockfishAPI  # Import the Stockfish class
from .LLM_engine.agents.main_coach import MainCoach
import pdb
import asyncio
from flask import request
import re
import logging
logging.basicConfig(level=logging.DEBUG)


def create_main_app():
    
    app = Flask(__name__)

    CORS(app, origins=["http://localhost:5173"])
    CORS(app)

    stockfish = StockfishAPI(depth=10)
    # chatbox = LLM_engine.ChatBox()
    coach = MainCoach()

    @app.route('/game_status', methods=['POST'])
    def game_status():
        data = request.get_json()
        fen = data.get("fen")

        # Validate FEN
        if not check.is_valid_fen(fen):
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": "Invalid FEN string provided."
                }),422

        try:
            game_status = stockfish.get_game_status(fen)
            if game_status == "No status available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "No status available."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        current_player = check.get_current_player(fen)

        # Response to client
        return jsonify({
            "current_player": current_player,
            "game_status": game_status,
            "fen": fen,
        }), 200


    @app.route('/evaluate_move', methods=['POST'])
    def evaluate_move():
        data = request.get_json()
        fen = data.get("fen")
        move = data.get("move")
        fixed_fen = ""
        logging.debug(f"Received data: {data}")
        
        # Validate FEN and move data
        if not fen or not move:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'fen' and 'move' fields are required."
            }), 400
        # pdb.set_trace()
        try:
            fixed_fen = check.fix_fen(fen)  # Apply fix_fen to correct invalid en passant fields
           
        except ValueError as e:
            return jsonify({
                "type": "invalid_fen_notation",
                "message": f"Invalid FEN format: {str(e)}"
            }), 422


        if not check.is_valid_fen(fixed_fen):
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": "Invalid FEN string provided."
                }),422  # This will create an error if FEN is invalid

            # 
        if not check.is_valid_move(fixed_fen, move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid move string provided."
            }), 422 # on promotion the error of undefined may be here
        
        try:
            new_fen = check.move_to_fen(fixed_fen, move)
            logging.debug("Fixed FEN is : "+ new_fen)
            logging.debug("FEN notation in line 90, on routes.py: "+ fen)
            evaluation = stockfish.get_evaluation(new_fen)
            # This line does not seem to execute, thus here is the stockfish error again
            logging.debug(f"Received Evaluation after stockfish function call: {evaluation}")
            if evaluation == "No score available":
                return jsonify({
                    "type": "evaluation_error",
                    "message": "Could not evaluate the move."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500


        try:
            game_status = 100 - stockfish.get_game_status(new_fen)
            if game_status == "No status available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "No status available."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        input = (
            new_fen,
            move,
            evaluation)

        # Send the prompt to the LLM via ChatBox
        try:
            response = coach.ask_move_feedback(input)
        except Exception as e:
            return jsonify({
                "type": "llm_error",
                "message": f"Failed to get a response from the LLM: {str(e)}"
            }), 500

        player_made_move = check.get_current_player(fen)
        current_player = check.get_current_player(new_fen)

        # Response to client
        return jsonify({
            "player_made_move": player_made_move,
            "evaluation": evaluation,
            "feedback": response,
        }), 200


    @app.route('/suggest_move', methods=['POST'])
    def move_suggestion():
        data = request.get_json()
        fen = data.get("fen")

        # Validate FEN
        if not fen:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'fen' and 'move' fields are required."
            }), 400

        if not check.is_valid_fen(fen):
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": "Invalid FEN string provided."
                }),422  # This will create an error if FEN is invalid

        try:
            move_suggestion = stockfish.get_move_suggestion(fen)
            if move_suggestion == "No suggestion available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "Could not evaluate the move."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        try:
            fen_move_suggestion = check.move_to_fen(fen, move_suggestion)
            evaluation = stockfish.get_evaluation(fen_move_suggestion)
            if evaluation == "No score available":
                return jsonify({
                    "type": "evaluation_error",
                    "message": "Could not evaluate the move."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        try:
            current_game_status = stockfish.get_game_status(fen)
            if game_status == "No status available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "No status available."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        new_fen = check.move_to_fen(fen, move_suggestion)

        try:
            new_game_status = stockfish.get_game_status(new_fen)
            if game_status == "No status available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "No status available."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        input = (fen, move_suggestion, evaluation)

        try:
            response = coach.ask_move_suggestion(input)
        except Exception as e:
            return jsonify({
                "type": "llm_error",
                "message": f"Failed to get a response from the LLM: {str(e)}"
            }), 500

        current_player = check.get_current_player(fen)

        return jsonify({
            "current_player": current_player,
            "suggested_move": move_suggestion,
            "suggestion": response,
            # "suggested_move": suggested_move
        }), 200


   
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "type": "not_found",
            "message": "The requested resource was not found."
        }), 404

    
    @app.errorhandler(500)
    def internal_server_error(error):
        logging.error(f"500 Error: {error}")
        return jsonify({"type": "internal_server_error", "message": str(error)}), 500


    return app
