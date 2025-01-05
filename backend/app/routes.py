# quart modules
import threading
from quart import jsonify, Quart, request
from quart_cors import cors

# stockfish modules
from .Stockfish_engine import StockfishEngine
from .Stockfish_engine import utils as stockfish_utils
from stockfish import StockfishException

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
    is_json_error,
    invalid_string_error
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
            return is_json_error()
        
        data = await request.get_json()
        fen = data.get("fen")
        move = data.get("move")

        # Validate FEN and move data
        if not fen or not move:
            return invalid_request_error(["'fen'", "'move'"])
                
        if not stockfish.is_fen_valid(fen):
            print(stockfish.check_endgame(fen))
            if stockfish.check_endgame(fen) is not None:
                type = stockfish.check_endgame(fen)
                return jsonify({
                    "player_made_move": stockfish_utils.get_current_player(fen),
                    "feedback": f"Game is ended in a {type}"
                }), 200 
            else:
                return invalid_fen_error()   
            
        if not stockfish.is_move_valid(fen, move):
            return invalid_move_error()
        
        try:
            fen_after_move = stockfish_utils.from_move_to_fen(fen, move)
            ask_input = {}
            if stockfish.check_endgame(fen_after_move) is None:
                delta_evaluation = stockfish.get_move_evaluation(fen, move)
                if delta_evaluation is None:
                    raise StockfishException("no evaluation for the current move")
                winning_percentage = 100 - stockfish.get_winning_percentage(fen_after_move).get("percentage")
                stockfish.reset_engine_parameters()

                ask_input.update({
                    "delta_evaluation": delta_evaluation,
                    "winning_percentage": winning_percentage
                })

            board_str = llm_utils.from_fen_to_board(fen_after_move)
            player_made_move = stockfish_utils.get_current_player(fen)
            ask_input.update({
                "board": board_str,
                "player": llm_utils.get_player(player_made_move),
                "move": stockfish_utils.uci_to_san(fen, move),
            })

            try:
                if stockfish.check_endgame(fen_after_move) is None:
                    response = coach.ask_move_feedback(ask_input)
                else:
                    ask_input["type"] = stockfish.check_endgame(fen_after_move)
                    response = coach.ask_endgame(ask_input)
            except Exception as e:
                return llm_error(e)
            
        except StockfishException as e:
            return stockfish_error(e)

        return jsonify({
            "player_made_move": player_made_move,
            "feedback": response,
        }), 200


    @app.route('/get_move_suggestion_with_evaluation', methods=['POST'])
    async def get_move_suggestion_with_evaluation():
        if not request.is_json:
            return is_json_error()
        
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return invalid_request_error(["fen"])
            
        if not stockfish.is_fen_valid(fen):
            if stockfish.check_endgame(fen) is not None:
                type = stockfish.check_endgame(fen)
                return jsonify({
                    "current_player": stockfish_utils.get_current_player(fen),
                    "suggested_move": "",
                    "suggestion": f"No more moves available, the game ended in a {type}"
                }), 200 
            else:
                return invalid_fen_error()

        try:
            # obtain from stockfish the best move
            suggested_move = stockfish.get_move_suggestion(fen)

            fen_after_move = stockfish_utils.from_move_to_fen(fen, suggested_move)
            ask_input = {}
            if stockfish.check_endgame(fen_after_move) is None:
                delta_evaluation = stockfish.get_move_evaluation(fen, suggested_move)
                if delta_evaluation is None:
                    raise StockfishException("no evaluation for the current move")
                winning_percentage = 100 - stockfish.get_winning_percentage(fen_after_move).get("percentage")
                stockfish.reset_engine_parameters()

                ask_input.update({
                    "delta_evaluation": delta_evaluation,
                    "winning_percentage": winning_percentage
                })

            board_str = llm_utils.from_fen_to_board(fen)
            current_player = stockfish_utils.get_current_player(fen)
            ask_input.update({
                "board": board_str,
                "player": llm_utils.get_player(current_player),
                "move": stockfish_utils.uci_to_san(fen, suggested_move),
            })

            try:
                if stockfish.check_endgame(fen_after_move) is None:
                    response = coach.ask_move_suggestion(ask_input) 
                else:
                    response = coach.move_suggestion_endgame(ask_input)
            except Exception as e:
                return llm_error(e)

        except StockfishException as e:
            return stockfish_error(e)

        return jsonify({
            "current_player": current_player,
            "suggested_move": suggested_move,
            "suggestion": response,
        }), 200


    @app.route('/get_bot_move', methods=['POST'])
    async def get_bot_move():
        if not request.is_json:
            return is_json_error()
        
        data = await request.get_json()
        fen = data.get("fen")
        skill_level = data.get("skill_level")

        if not fen or not skill_level:
            return invalid_request_error(["fen","skill_level"])
        
         # Validate FEN and ensure no endgame condition
        if not stockfish.is_fen_valid(fen):
            if stockfish.check_endgame(fen) is not None:
                return jsonify({
                    "bot_move": ""
                }), 200
            else: 
                return invalid_fen_error()
            
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
            return is_json_error()
        
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return invalid_request_error(["fen"])

        # Validate FEN and ensure no endgame condition
        if not stockfish.is_fen_valid(fen):
            if stockfish.check_endgame(fen) is not None:
                return jsonify({
                    "suggested_move": ""
                }), 200 
            else:
                return invalid_fen_error()

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
            return is_json_error()
        
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return invalid_request_error(["fen"])
           
        if not stockfish.is_fen_valid(fen):
            if stockfish.check_endgame(fen) is not None:
                type = stockfish.check_endgame(fen)
                return jsonify({
                    "answer": f"Game is over: {type}"
                }), 200 
            else:
                return invalid_fen_error()    

        try:
            # game_status_evaluation = stockfish.get_board_evaluation(fen)
            winning_percentage = stockfish.get_winning_percentage(fen).get("percentage")
            # reset stockfish_parameters
            stockfish.reset_engine_parameters()
        except StockfishException as e:
            return stockfish_error(e)
        
        try:
            board_str = llm_utils.from_fen_to_board(fen)
            current_player = stockfish_utils.get_current_player(fen)
            ask_input = {
                "board": board_str,
                "player": llm_utils.get_player(current_player),
                "winning_percentage": winning_percentage
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
            return is_json_error()
        
        data = await request.get_json()
        fen = data.get("fen")

        if not fen:
            return invalid_request_error(["fen"])
        
        # Validate FEN and ensure no endgame condition
        if not stockfish.is_fen_valid(fen):
            if stockfish.check_endgame(fen) is not None:
                return jsonify({
                    "current_player": stockfish_utils.get_current_player(fen),
                    "percentage": None
                }), 200 
            else:
                return invalid_fen_error()
        try:
            winning_percentage = stockfish.get_winning_percentage(fen)
            # reset stockfish_parameters
            stockfish.reset_engine_parameters()

            return jsonify(
                winning_percentage
            ), 200
        
        except StockfishException as e:
            return stockfish_error(e) 
        

    @app.route('/more_explanation', methods=['POST'])
    async def more_explanation():
        
        if not request.is_json: 
            return is_json_error()
            
        data = await request.get_json()
        question = data.get("question")
        first_answer = data.get("first_answer")

        if not question or not first_answer:
            return invalid_request_error(["question", "first_answer"])

        if not llm_utils.is_string_valid(question):
            return invalid_string_error()
            
        if not llm_utils.is_string_valid(first_answer):
            return invalid_string_error()

        try:
            ask_input = {
                "question": question,
                "first_answer": first_answer
            }

            answer = coach.ask_more_explanation(ask_input)

        except Exception as e:
            return llm_error(e)

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
