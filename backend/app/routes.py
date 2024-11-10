from flask import jsonify, request, Flask
from flask_cors import CORS
from app.LLM_engine import utilities as check
import chess
from .chess_engine import ChessEngine
from .stockfish_api import Stockfish  # Import the Stockfish class
from app.LLM_engine import LLM_engine
from .LLM_engine.agents.main_coach import MainCoach
import pdb;


def create_main_app():

    app = Flask(__name__)
    CORS(app)

    game = ChessEngine()
    stockfish = Stockfish(depth=10)
    # chatbox = LLM_engine.ChatBox()
    coach = MainCoach(player_color="b")

    @app.route('/api/send_possible_move', methods=['POST'])
    def send_possible_move():
        data = request.get_json()
        selected_square = data.get('square')
        try:
            square_index = chess.parse_square(selected_square)
        except ValueError:
            return jsonify({'error': 'Invalid square notation'}), 400
        piece = game.board.piece_at(square_index)
        if piece is None:
            return jsonify({'error': 'No piece at the selected square'}), 400
        moves_uci = game.get_possible_moves(square_index)
        return jsonify({'moves_uci': moves_uci})

    @app.route('/api/send_make_move', methods=['POST'])
    def send_make_move():
        data = request.get_json()
        move_uci = data['move']
        if game.is_illegal_move(move_uci):
            return jsonify({'error': 'Illegal move'}), 400
        game.make_move(move_uci)
        return jsonify({'fen': game.board.fen()})

    @app.route('/api/get_board', methods=['GET'])
    def get_board():
        return jsonify({'fen': game.board.fen()})

    @app.route('/reset_game', methods=['POST'])
    def reset_game():
        game.reset_game()
        return jsonify({'fen': game.board.fen()})
    
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

        # Check if the FEN notation is valid
        try:
            if not check.is_fen_valid(fen):
                return jsonify({
                    "type": "invalid_fen_notation",
                    "message": "Invalid FEN string provided."
                }),422  # This will create an error if FEN is invalid
        except ValueError:
            return jsonify({
                "type": "invalid_fen_notation",
                "message": "Invalid FEN string provided."
            }), 422

        # Check if the move notation is valid
        try:
            if not check.is_move_valid(fen, move):  # true if valid, false otherwise
                return jsonify({
                    "type": "invalid_move",
                    "message": "Invalid move notation provided."
                }), 422
        except ValueError:
            return jsonify({
                "type": "invalid_move",
                "message": "Invalid move notation provided."
            }), 422
        
        try:
            # pdb.set_trace()

            evaluation_diff = stockfish.evaluate_move_score(fen, move, player_color="b")  # Assuming black's move
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
