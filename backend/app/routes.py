from flask import jsonify, Flask
from flask_cors import CORS
from .LLM_engine import utilities as check
import chess
from .stockfish_api import Stockfish  # Import the Stockfish class
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

    stockfish = Stockfish(depth=10)
    # chatbox = LLM_engine.ChatBox()
    coach = MainCoach(player_color="w")


    @app.route('/evaluate_move', methods=['POST'])
    def evaluate_move():
        data = request.get_json()
        fen = data.get("fen")
        move = data.get("move")
        logging.debug(f"Received data: {data}")
        
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

            # 
        if not check.is_valid_move(fen, move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid move string provided."
            }), 422 # on promotion the error of undefined may be here
        
        try:
            evaluation_diff = stockfish.evaluate_move_score(fen, move)
            if evaluation_diff == "No score available":
                evaluation_diff = 0.0 # let us return a evalution of 0.0 in case the stockfish fails to provide an answer      
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500
        logging.debug(f"EVALUATION DIFF: {evaluation_diff}")
 
        evaluation = evaluation_diff  # Evaluation we get from stockfish
        suggested_move = "Nf6"  # Example suggested move
        # Send the prompt to the LLM via ChatBox
        try:
            # llm_feedback = chatbox.ask(prompt)
            response = coach.ask_move_feedback(move, fen, evaluation)
             
        except Exception as e:
            return jsonify({
                "type": "llm_error",
                "message": f"Failed to get a response from the LLM: {str(e)}"
            }), 500

        # Response to client
        if evaluation and re.search(r'\d', response):
            return jsonify({
            "evaluation": evaluation,
            "feedback": response,
            "suggested_move": suggested_move
            }), 200
        else:
            if not evaluation:
                logging.debug("Evaluation is empty")
                return jsonify({
                "evaluation": evaluation,
                "feedback": response,
                "suggested_move": suggested_move
                }), 200
            if not re.search(r'\d', response):
                logging.debug("Response is missing a numeric value")
            logging.debug(f"Evaluation: {evaluation}, Response: {response}")
            return jsonify({
            "type": "invalid_feedback",
            "message": "Feedback is missing a numeric value or evaluation is empty."
            }), 400

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
