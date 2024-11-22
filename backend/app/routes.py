from flask import jsonify, Flask
from flask_cors import CORS
from .LLM_engine import utilities as check
import chess
from .stockfish_api import Stockfish  # Import the Stockfish class
from .LLM_engine.agents.main_coach import MainCoach
import pdb
from flask import request


def create_main_app():

    app = Flask(__name__)
    CORS(app)

    stockfish = Stockfish(depth=10)
    # chatbox = LLM_engine.ChatBox()
    coach = MainCoach(player_color="w")

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
            evaluation_diff = stockfish.evaluate_move_score(fen, move, player_color="w")  # Assuming black's move
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


        # Hardcoded responses for demonstration will need to merge with LLM and Stockfish
        evaluation = evaluation_diff  # Evaluation we get from stockfish
        suggested_move = "Nf6"  # Example suggested move
      # Prepare data for the LLM
       

        # Send the prompt to the LLM via ChatBox
        try:
            # llm_feedback = chatbox.ask(prompt)
            response = coach.ask_move_feedback(move, fen)
        except Exception as e:
            return jsonify({
                "type": "llm_error",
                "message": f"Failed to get a response from the LLM: {str(e)}"
            }), 500

        # Response to client
        return jsonify({
            "evaluation": evaluation,
            "feedback": response,
            "suggested_move": suggested_move
        }), 200

    @app.route('/answer_question', methods=['POST'])
    def answer_question():
        data = request.get_json()
        fen = data.get("fen")
        question = data.get("question")
        
        # Validate FEN and question data
        if not fen or not question:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'fen' and 'question' fields are required."
            }), 400

        if not check.is_valid_fen(fen):
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": "Invalid FEN string provided."
                }),422  # This will create an error if FEN is invalid
                
        
        if not check.is_valid_question(question):
            return jsonify({
                "type": "invalid_question",
                "message": "Invalid question string provided."
            }), 422 # This will create an error if question is invalid
            
        try:       
            #ask question to the LLM
            answer = coach.ask_chess_question(fen, question)
        except Exception as e:
            return jsonify({
                "type": "llm_error",
                "message": f"Failed to get a response from the LLM: {str(e)}"
            }), 500

        # Response to client
        return jsonify({
            "answer": answer
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

