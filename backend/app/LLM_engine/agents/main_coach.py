from LLM_engine import stockfish
from LLM_engine import ChatBox


class MainCoach(ChatBox):
    def __init__(self):
        super().__init__()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
        For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
        Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
        the move you suggested, move sequences, or any general advice they may seek."""
        self.conversation_history.append({"role": "user", "content": self.prompt})
        self.conversation_history.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})
        self.stockfish = stockfish
    
    def evaluate_move_score(self,fen, move, player_is_white):
        self.stockfish.set_fen_position(fen)
        best_evaluation = self.stockfish.get_evaluation()
        self.stockfish.make_moves_from_current_position([move])
        player_evaluation = self.stockfish.get_evaluation()
        evaluation_difference = player_evaluation['value'] - best_evaluation['value']
        if not player_is_white:
            evaluation_difference = -evaluation_difference
        max_penalty = 300 #0/20
        score = max(0, 20 - (abs(evaluation_difference) * 20 / max_penalty))
        return round(score, 2)

    def ask_moove_feedback(self,moove,fen):
        evaluation = self.evaluate_move_score(fen,moove,True)
        return (self.ask(f"""The current state of the board is as follows in FEN notation: \n  {self.chessboard} \n
        The user moove is {moove}. The evaluation of this moove by stockfish is {evaluation}/20.\n
        Provide feedback on this moove. Coach the user by providing explanation to the evaluation."""))


    
