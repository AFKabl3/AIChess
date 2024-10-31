from flask import jsonify, request, Flask
import chess
from chess_game import ChessGame

def create_main_app():

    main = Flask(__name__)


    game = ChessGame()

    @main.route('/send_move', methods=['POST'])
    def send_move():
        data = request.get_json()
        move = data['move']
        game.make_move(move)
        return jsonify({'fen': game.board.fen()})

    @main.route('/get_board', methods=['GET'])
    def get_board():
        return jsonify({'fen': game.board.fen()})

    @main.route('/reset_game', methods=['POST'])
    def reset_game():
        game.reset_game()
        return jsonify({'fen': game.board.fen()})
    
    return main
