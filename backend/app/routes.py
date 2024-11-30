from flask import jsonify, Flask
from flask_cors import CORS
from .LLM_engine import helper_functions as check
import chess
from .stockfish_api import StockfishAPI  # Import the Stockfish class
from .LLM_engine.agents.main_coach import MainCoach
from flask import request
import time


def create_main_app():

    app = Flask(__name__)
    CORS(app)

    stockfish = StockfishAPI(depth=10)

    # chatbox = LLM_engine.ChatBox()
    coach = MainCoach()

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

    @app.route('/get_bot_move', methods=['POST'])
    def get_bot_move():
        # we retrive the json file sent to this API including:
        # - fen of the board
        data = request.get_json()
        fen = data.get("fen")
        depth = data.get("depth")

        if not fen and not depth:
                return jsonify({
                    "type": "invalid_request",
                    "message": "Both 'fen' and 'depth' fields are required."
                }), 400

        if not check.is_valid_fen(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422  # This will create an error if FEN is invalid

        if not check.is_valid_depth(depth):
            return jsonify({
                "type": "invalid_depth",
                "message": "Invalid depth provided."
            }), 422

        # we create a chess bot which is nothing else than a Stockfish class instance with certain params
        # Here the depth is set to 2 if not specified in the request;
        # To be customizable we can make settings in UI to modify it and simply pass that paramenter that is stored locally
        # Otherwise we have to store it in backend, letting interaction not being stateless and have a class "chess_bot"
        # always active for each player and a new API-function to set the strenght of the bot
        # Probably best is to save it in client and simply pass that parameter, here it will be set to default strenght = 2

        try:

            # Now we call "get evaluation" method from Stockfish class
            # and as param we pass the fen
            fen = check.is_valid_input_notation(fen)
            chess_bot = StockfishAPI(depth=depth)
            bot_move = chess_bot.get_next_best_move(fen, depth)
            if bot_move == "No status available":
                return jsonify({
                    "type": "stockfish_error",
                    "message": "Could not generate the move."
                }), 500

        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        # We respond to the caller of the API with the move the bot will play
        return jsonify({
            "bot_move": bot_move
        })

    @app.route('/evaluate_move', methods=['POST'])
    def evaluate_move():
        time.sleep(0.2)
        data = request.get_json()
        fen = data.get("fen")
        move = data.get("move")

        if not fen or not move:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'fen' and 'move' fields are required."
            }), 400

        if not check.is_valid_fen(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422

        if not check.is_valid_move(fen, move):
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid move string provided."
            }), 422

        try:
            new_fen = check.move_to_fen(fen, move)
            new_fen = check.is_valid_input_notation(fen)
            evaluation = stockfish.get_evaluation(new_fen)

            if evaluation == "No score available":
                logging.error("Evaluation not available for FEN")
                return jsonify({
                    "type": "evaluation_error",
                    "message": "Could not evaluate the move."
                }), 500

           
            game_status = 100 - stockfish.get_game_status(new_fen)
            if game_status == "No status available":
                logging.error("No game status available")
                return jsonify({
                    "type": "stockfish_error",
                    "message": "No status available."
                }), 500

            input = (new_fen, move, evaluation)
            response = coach.ask_move_feedback(input)

        except Exception as e:
            return jsonify({
                "type": "stockfish_error",
                "message": str(e)
            }), 500

        player_made_move = check.get_current_player(fen)
        current_player = check.get_current_player(new_fen)

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
            fen = check.is_valid_input_notation(fen)
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
