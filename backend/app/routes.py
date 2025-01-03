# quart modules
import threading
from quart import jsonify, Quart, request
from quart_cors import cors

# stockfish modules
from .Stockfish_engine import StockfishEngine
from .Stockfish_engine import utils as stockfish_utils
from stockfish import StockfishException
import pdb
# Assistant module
from .LLM_engine import MainCoach
from .LLM_engine import utils as llm_utils

# Error handling functions
from .error_handlers import (
    invalid_request_error,
    invalid_fen_error,
    invalid_move_error,
    stockfish_error,
    llm_error,
    invalid_question_error
)

def create_main_app():

    app = Quart(__name__)
    app = cors(app)
    
    # stockfish instance creation
    stockfish_path = stockfish_utils.get_stockfish_binary_path()
    stockfish = StockfishEngine(path=stockfish_path)

    # main coach instance creation
    api_key = llm_utils.get_llm_api()
    coach = MainCoach(api_key=api_key)

    @app.route('/evaluate_move', methods=['POST'])
    async def evaluate_move():
        if not request.is_json:
            return jsonify({
                "type": "invalid_request",
                "message": "Request must be a JSON object."
            }), 400
        data = await request.get_json()
        fen = data.get("fen")
        move = data.get("move")

        # Validate FEN and move data
        if not fen or not move:
            return invalid_request_error(["'fen'", "'move'"])

        if not stockfish.is_fen_valid(fen):
            is_game_over = stockfish.is_game_over(fen)
            if is_game_over.get("is_game_over"):
                return jsonify({
                    "type": "game_over",
                    "message": f"Game is over: {is_game_over.get('type')}"
                }), 422
            else:
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": is_game_over.get('type')
                }), 422
                
                
        move_validity = stockfish.is_move_valid(fen, move)
        if not move_validity["is_valid"]:
            return invalid_move_error()
        
        try:
            fen_after_move = stockfish_utils.from_move_to_fen(fen, move)
            board_str = llm_utils.from_fen_to_board(fen_after_move)
            current_player = stockfish_utils.get_current_player(fen)
        except Exception as e:
            return stockfish_error(e)
        
        ask_input = {
            "board": board_str,
            "player": llm_utils.get_player(current_player),
            "move": move,
        }

        if move_validity["endgame"] is not None:
            try:
                    response = coach.ask_endgame(ask_input)
            except Exception as e:
                    return llm_error(e)

            return jsonify({
                "player_made_move": current_player,
                "feedback": response,
            }), 200
        else:
        # Proceed with delta evaluation for normal moves
            try:
                delta_evaluation = stockfish.get_move_evaluation(fen, move)
                stockfish.reset_engine_parameters()

                if delta_evaluation is None:
                    raise StockfishException("No evaluation for the current FEN")
                ask_input["delta_evaluation"] = delta_evaluation
                try:
                    response = coach.ask_move_feedback(ask_input)
                except Exception as e:
                    return llm_error(e)
            
            except StockfishException as e:
                return stockfish_error(e)

            return jsonify({
                "player_made_move": current_player,
                "feedback": response,
            }), 200

    @app.route('/get_move_suggestion_with_evaluation', methods=['POST'])
    async def get_move_suggestion_with_evaluation():
        if not request.is_json:
            return jsonify({
                "type": "invalid_request",
                "message": "Request must be a JSON object."
            }), 400
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return invalid_request_error(["fen"])
        
        board = stockfish.fen_to_board(fen)
        # we dont need to call LLM, just pass in some message as suggestion so it displays in chat, in order to not allow user to spam the LLM in case he wins the game.
        if stockfish.check_endgame(board) is not None:
            type = stockfish.check_endgame(board)
            return jsonify({
            "suggested_move": '',
            "suggestion": f'No more moves available, it is a {type}',
        }), 200 
            
        if not stockfish.is_fen_valid(fen):
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Fen notation provided is wrong"
            }), 422
            
        # if not stockfish.is_fen_valid(fen):
        #     is_game_over = stockfish.is_game_over(fen)
        #     if is_game_over.get("is_game_over"):
        #         return jsonify({
        #             "type": "game_over",
        #             "message": f"Game is over: {is_game_over.get('type')}"
        #         }), 422
        #     else:
        #         return jsonify({
        #             "type": "invalid_fen_notation",
        #             "message": is_game_over.get('type')
        #         }), 422
        

            # if not endgame, proceed as usual
        try:
            # obtain from stockfish the best move
            suggested_move = stockfish.get_move_suggestion(fen)

            # calculate the evaluation of the move
            delta_evaluation = stockfish.get_move_evaluation(fen, suggested_move)

            # reset stockfish_parameters
            stockfish.reset_engine_parameters()

            if delta_evaluation is None:
                raise StockfishException("no evaluation for the current fen")

            try:
                board_str = llm_utils.from_fen_to_board(fen)
                current_player = stockfish_utils.get_current_player(fen)
                ask_input = {
                    "board": board_str,
                    "player": llm_utils.get_player(current_player),
                    "move": suggested_move,
                    "delta_evaluation": delta_evaluation
                }

                response = coach.ask_move_suggestion(ask_input)

            except Exception as e:
                return llm_error(e)

        except StockfishException as e:
            return stockfish_error(e)

        return jsonify({
            "current_player": current_player,
            "suggested_move": suggested_move,
            "suggestion": response,
        }), 200

    @app.route('/answer_question', methods=['POST'])
    async def answer_question():
        if not request.is_json:
            return jsonify({
                "type": "invalid_request",
                "message": "Request must be a JSON object."
            }), 400
        data = await request.get_json()
        fen = data.get("fen")
        question = data.get("question")

        if not fen or not question:
            return invalid_request_error(["fen","question"])

        if not stockfish.is_fen_valid(fen):
            is_game_over = stockfish.is_game_over(fen)
            if is_game_over.get("is_game_over"):
                return jsonify({
                    "type": "game_over",
                    "message": f"Game is over: {is_game_over.get('type')}"
                }), 422
            else:
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": is_game_over.get('type')
                }), 422

        if not llm_utils.is_string_valid(question):
            return jsonify({
                "type": "invalid_question",
                "message": "Invalid question string provided."
            }), 422

        try:
            evaluation = stockfish.get_board_evaluation(fen)

            # reset stockfish parameters
            stockfish.reset_engine_parameters()

            if evaluation is None:
                raise StockfishException("no evaluation for the current fen")

            try:
                board_str = llm_utils.from_fen_to_board(fen)
                current_player = stockfish_utils.get_current_player(fen)
                ask_input = {
                    "board": board_str,
                    "player": llm_utils.get_player(current_player),
                    "question": question,
                    "evaluation": evaluation
                }

                answer = coach.ask_chess_question(ask_input)

            except Exception as e:
                return llm_error(e)

        except StockfishException as e:
            return stockfish_error(e)

        return jsonify({
            "answer": answer
        }), 200

    @app.route('/get_bot_move', methods=['POST'])
    async def get_bot_move():
        # pdb.set_trace()
        if not request.is_json:
            return jsonify({
                "type": "invalid_request",
                "message": "Request must be a JSON object."
            }), 400
        data = await request.get_json()
        fen = data.get("fen")
        skill_level = data.get("skill_level")

        if not fen or not skill_level:
            return invalid_request_error(["fen","skill_level"])

        if not stockfish.is_fen_valid(fen):
            is_game_over = stockfish.is_game_over(fen)
            if is_game_over.get("is_game_over"):
                return jsonify({
                    "type": "game_over",
                    "message": f"Game is over: {is_game_over.get('type')}"
                }), 403
            else:
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": is_game_over.get('type')
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
            return stockfish_error(e)

        return jsonify({
            "bot_move": bot_move
        }), 200

    @app.route('/get_best_move', methods=['POST'])
    async def get_best_move():
        if not request.is_json:
            return jsonify({
                "type": "invalid_request",
                "message": "Request must be a JSON object."
            }), 400
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return invalid_request_error(["fen"])

        if not stockfish.is_fen_valid(fen):
            is_game_over = stockfish.is_game_over(fen)
            if is_game_over.get("is_game_over"):
                return jsonify({
                    "type": "game_over",
                    "message": f"Game is over: {is_game_over.get('type')}"
                }), 422
            else:
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": is_game_over.get('type')
                }), 422

        try:
            # obtain from stockfish the best move
            suggested_move = stockfish.get_move_suggestion(fen)

            # reset stockfish_parameters
            stockfish.reset_engine_parameters()

        except StockfishException as e:
            return stockfish_error(e)

        return jsonify({
            "suggested_move": suggested_move
        }), 200

    @app.route('/get_game_status', methods=['POST'])
    async def get_game_status():
        if not request.is_json:
            return jsonify({
                "type": "invalid_request",
                "message": "Request must be a JSON object."
            }), 400
        
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return invalid_request_error(["fen"])

        if not stockfish.is_fen_valid(fen):
            is_game_over = stockfish.is_game_over(fen)
            if is_game_over.get("is_game_over"):
                return jsonify({
                    "type": "game_over",
                    "message": f"Game is over: {is_game_over.get('type')}"
                }), 422
            else:
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": is_game_over.get('type')
                }), 422

        try:
            game_status_evaluation = stockfish.get_board_evaluation(fen)
            # reset stockfish_parameters
            stockfish.reset_engine_parameters()
        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": f"Failed to get a response from the stockfish: {str(e)}"
            }), 500
        
        try:
            board_str = llm_utils.from_fen_to_board(fen)
            current_player = stockfish_utils.get_current_player(fen)
            ask_input = {
                "board": board_str,
                "player": llm_utils.get_player(current_player),
                "evaluation": game_status_evaluation
            }
            answer = coach.ask_game_status_explanation(ask_input)
        except Exception as e:
            return llm_error(e)

        return jsonify({
            "answer": answer
        }), 200
    
    
    @app.route('/get_winning_percentage', methods=['POST'])
    async def get_winning_percentage():
        if not request.is_json:
            return jsonify({
                "type": "invalid_request",
                "message": "Request must be a JSON object."
            }), 400
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return jsonify({
                "type": "invalid_request",
                "message": "'fen' field is required."
            }), 400

        if not stockfish.is_fen_valid(fen):
            is_game_over = stockfish.is_game_over(fen)
            if is_game_over.get("is_game_over"):
                return jsonify({
                    "type": "game_over",
                    "message": f"Game is over: {is_game_over.get('type')}"
                }), 422
            else:
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": is_game_over.get('type')
                }), 422
        
        try:
            winning_percentage = stockfish.get_winning_percentage(fen)
            
            # reset stockfish_parameters
            stockfish.reset_engine_parameters()

            return jsonify(
                winning_percentage
            ), 200
        
        except StockfishException as e:
            return jsonify({
                "type": "stockfish_error",
                "message": f"Failed to get a response from the stockfish: {str(e)}"
            }), 500  

    @app.route('/more_explanation', methods=['POST'])
    async def more_explanation():
        
        if not request.is_json: 
            return jsonify({ 
                "type": "invalid_request", 
                "message": "Request must be a JSON object." 
            }), 400
            
        data = await request.get_json()
        question = data.get("question")
        first_answer = data.get("first_answer")

        if not question or not first_answer:
            return jsonify({
                "type": "invalid_request",
                "message": "Both 'question' and 'first_answer' fields are required."
            }), 400

        if not llm_utils.is_string_valid(question):
            return jsonify({
                "type": "invalid_question",
                "message": "Invalid question string provided."
            }), 422
            
        if not llm_utils.is_string_valid(first_answer):
            return jsonify({
                "type": "invalid_first_answer",
                "message": "Invalid first_answer string provided."
            }), 422

        try:
            ask_input = {
                "question": question,
                "first_answer": first_answer
            }

            answer = coach.ask_chess_question(ask_input)

        except Exception as e:
            return jsonify({
                "type": "llm_error",
                "message": f"Failed to get a response from the LLM: {str(e)}"
            }), 500

        return jsonify({
            "answer": answer
        }), 200

    @app.errorhandler(404)
    async def not_found(error):
        return jsonify({
            "type": "not_found",
            "message": "The requested resource was not found. "
        }), 404

    @app.errorhandler(500)
    async def internal_server_error(error):
        return jsonify({
            "type": "internal_server_error",
            "message": "An unexpected error occurred. Please try again."
        }), 500

    return app
