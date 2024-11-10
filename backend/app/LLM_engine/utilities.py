import chess

# def is_move_valid(fen, move):
#     board = chess.Board(fen)
#     try:
#         chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
#     except ValueError:
#         return False
#     return chess_move in board.legal_moves

def is_valid_fen(fen):
    try:
        board = chess.Board(fen)
        return True
    except ValueError:
        return False

def is_valid_move(fen, move):
    try:
        board = chess.Board(fen)
        chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
        board.push(chess_move)
        fen = board.fen()
        is_valid_fen(fen)
    except ValueError:
        return False