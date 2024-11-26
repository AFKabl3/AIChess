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

    #stockfishAPI
    default_depth = 10
    stockfish = StockfishAPI(depth=default_depth)

    # chatbox = LLM_engine.ChatBox()
    coach = MainCoach()

    # TODO
    @app.route('/game_status', methods=['POST'])
    def game_status():
        data = request.get_json()
        fen = data.get("fen")

        if not fen:
            return jsonify({
                "type": "invalid_request",
                "message": "'fen'  field is required."
            }), 400

        # Validate FEN
        if not check.is_valid_fen(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422

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

    @app.route('/get_next_move', methods=['POST'])
    def get_next_move():

        data = request.get_json()
        fen = data.get("fen")
        depth = data.get("depth")

        if not fen:
                return jsonify({
                    "type": "invalid_request",
                    "message": "'fen' field is required."
                }), 400

        if not check.is_valid_fen(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422  # This will create an error if FEN is invalid

        if depth:
            if not check.is_valid_depth(depth):
                return jsonify({
                    "type": "invalid_depth",
                    "message": "Invalid depth provided."
                }), 422
            stockfish.modify_depth(depth)

        try:
            best_move = stockfish.get_best_move(fen)
            if best_move == "No move available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "Could not generate the move."
                }), 500
            current_player= check.get_current_player(fen)
            return jsonify({
                "current_player": current_player,
                "best_move": best_move
            }), 200
        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500



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
            }), 422  # This will create an error if FEN is invalid

        if not check.is_valid_move(fen, move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid move string provided."
            }), 422

        try:
            new_fen = check.move_to_fen(fen, move)
            evaluation = stockfish.get_evaluation(new_fen)
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
            }), 422  # This will create an error if FEN is invalid

        try:
            move_suggestion = stockfish.get_move_suggestion(fen)
            if move_suggestion == "No suggestion available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "Could not generate the move."
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
