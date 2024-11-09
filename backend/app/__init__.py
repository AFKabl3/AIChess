from flask import jsonify, request, Flask
from flask_cors import CORS
from .stockfish_api import Stockfish
from .LLM_engine.agents.main_coach import MainCoach


def create_app():
    app = Flask(__name__)
    CORS(app)
    coach = MainCoach()
    stockfish = Stockfish()

    @app.route('/evaluate_move', methods=['POST'])
    def evaluate_move():
        data = request.get_json()
        fen = data.get('fen')
        move = data.get('move')

        if not fen or not move:
            return jsonify({"type": "invalid_request", "message": "FEN and move are required."}), 400

        # Mock evaluation logic
        evaluation_score = stockfish.evaluate_move_score(fen, move)
        feedback = coach.ask_move_feedback(move, fen)

        return jsonify({
            "evaluation": evaluation_score,
            "feedback": feedback
        }), 200

    @app.route('/answer_question', methods=['POST'])
    def answer_chess_question():
        data = request.get_json()
        fen = data.get('fen')
        question = data.get('question')

        if not fen or not question:
            return jsonify({"type": "invalid_request", "message": "FEN and question are required."}), 400

        # Mock answer logic
        answer = "Try to ensure the pawns defend each other, and don't stack pawns."

        return jsonify({"answer": answer}), 200

    @app.route('/suggest_move', methods=['POST'])
    def suggest_move():
        data = request.get_json()
        fen = data.get('fen')

        if not fen:
            return jsonify({"type": "invalid_request", "message": "FEN is required."}), 400

        # Mock move suggestion logic
        suggested_move = "Nf6"

        return jsonify({"move": suggested_move}), 200

    @app.route('/suggest_move_with_explanation', methods=['POST'])
    def suggest_move_with_explanation():
        data = request.get_json()
        fen = data.get('fen')

        if not fen:
            return jsonify({"type": "invalid_request", "message": "FEN is required."}), 400

        # Mock move suggestion with explanation logic
        suggested_move = "Nf6"
        explanation = "Nf6 develops a knight to a natural square, supporting the center and preparing for castling."

        return jsonify({
            "move": suggested_move,
            "explanation": explanation
        }), 200

    return app
