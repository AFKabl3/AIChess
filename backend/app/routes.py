from flask import Blueprint, render_template, jsonify, request
import chess

main = Blueprint('main', __name__)


game = chess.Board()

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/move', methods=['POST'])
def move():
    global game
    data = request.get_json()
    move_uci = data.get('move')
    try:
        move = chess.Move.from_uci(move_uci)
        if move in game.legal_moves:
            game.push(move)
            return jsonify({'status': 'success', 'fen': game.fen()})
        else:
            return jsonify({'status': 'invalid move'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@main.route('/reset', methods=['POST'])
def reset():
    global game
    game = chess.Board()
    return jsonify({'status': 'reset', 'fen': game.fen()})
