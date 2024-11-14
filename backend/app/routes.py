from flask import jsonify, Flask
from flask_cors import CORS
from .LLM_engine import helper_functions as check
import chess
from .stockfish_api import StockfishAPI  # Import the Stockfish class
from .LLM_engine.agents.main_coach import MainCoach
import pdb
from flask import request



def create_main_app():

    app = Flask(__name__)
    CORS(app)

    stockfish = StockfishAPI(depth=10)
    # chatbox = LLM_engine.ChatBox()
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

        if not check.is_valid_fen(fen):
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": "Invalid FEN string provided."
                }),422  # This will create an error if FEN is invalid


        if not check.is_valid_move(fen, move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid move string provided."
            }), 422
        
        try:
            evaluation_diff = stockfish.evaluate_move_score(fen, move)
            if evaluation_diff == "No score available":
                return jsonify({
                    "type": "evaluation_error",
                    "message": "Could not evaluate the move."
                }), 500
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        new_fen = check.move_to_fen(fen, move)
        input = (
            new_fen,
            move,
            evaluation_diff)


        # Hardcoded responses for demonstration will need to merge with LLM and Stockfish
        evaluation = evaluation_diff  # Evaluation we get from stockfish
        # suggested_move = stockfish.get_move_suggestions(fen)
        # Prepare data for the LLM
       

        # Send the prompt to the LLM via ChatBox
        try:
            # llm_feedback = chatbox.ask(prompt)
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
            "fen": fen,
            "new_fen": new_fen,
            "current_player": current_player,
            "player_made_move": player_made_move,
            "evaluation": evaluation,
            "feedback": response,
            # "suggested_move": suggested_move
        }), 200


    @app.route('/suggest_move', methods=['POST'])
    def move_suggestion():
        data = request.get_json()
        fen = data.get("fen")

        # Validate FEN and move data
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
            evaluation = stockfish.evaluate_move_score(fen, move_suggestion)
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
            "fen": fen,
            "current_player": current_player,
            "evaluation": evaluation,
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
        return jsonify({
            "type": "internal_server_error",
            "message": "An unexpected error occurred."
        }), 500

    return app
