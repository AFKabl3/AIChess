from flask import jsonify, request, Flask
from flask_cors import CORS
import chess
from chess_engine import ChessEngine

def create_main_app():

    app = Flask(__name__)
    CORS(app)

    game = ChessEngine()

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
    
    return app
