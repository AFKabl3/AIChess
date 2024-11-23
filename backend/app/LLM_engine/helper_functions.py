import chess
def is_valid_fen(fen):
    try:
        board = chess.Board(fen)
        return board.is_valid()     # <- check basic chess rules => we have to trust the frontend engine
    except ValueError:
        return False

def is_valid_move(fen, move):
    try:
        board = chess.Board(fen)
        chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
        board.push(chess_move)
        fen = board.fen()
        return is_valid_fen(fen)
    except ValueError:
        return False
    
def is_valid_question(question):
    if len(question) > 200: #provisional error control, checks the question is not more than 200 characters long
        return False
    return True