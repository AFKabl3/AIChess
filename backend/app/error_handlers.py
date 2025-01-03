# error_handlers.py

from quart import jsonify
import logging

def invalid_request_error(missing_fields):
    if isinstance(missing_fields, str):
        missing_fields = [missing_fields]
    return jsonify({
        "type": "invalid_request",
        "message": f"The following fields are required: {', '.join(missing_fields)}."
    }), 400


def invalid_question_error():
    return jsonify({
        "type": "invalid_question",
        "message": "Invalid question string provided."
    }), 422

def invalid_fen_error():
    return jsonify({
        "type": "invalid_fen_notation",
        "message": "Invalid FEN string provided."
    }), 422

def invalid_move_error():
    return jsonify({
        "type": "invalid_move",
        "message": "Invalid/illegal move provided."
    }), 422

def stockfish_error(e):
    return jsonify({
        "type": "stockfish_error",
        "message": f"Failed to get a response from Stockfish: {str(e)}"
    }), 500

def llm_error(e):
    return jsonify({
        "type": "llm_error",
        "message": f"Failed to get a response from the LLM: {str(e)}"
    }), 500
