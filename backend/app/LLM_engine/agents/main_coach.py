from ...stockfish_api import StockfishAPI
from .chatbox import ChatBox
import pdb


class MainCoach(ChatBox):
    def __init__(self):
        super().__init__()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
        For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
        Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
        the move you suggested, move sequences, or any general advice they may seek."""
        self.conversation_history.append({"role": "user", "content": self.prompt})
        self.conversation_history.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})
        self.stockfish = StockfishAPI(depth=10)


    def ask_move_feedback(self,evaluation):
        fen, move, move_evaluation = evaluation
        return (self.ask(f"""The current state of the board is as follows in FEN notation: \n  {fen} \n
        The user move is {move}. The evaluation of this move by stockfish is {move_evaluation}.\n
        Provide feedback on this move. Try to limit the response to 150 words. Coach the user by providing explanation to the evaluation."""))

    def ask_move_suggestion(self, suggestion):
        fen, move_suggestion, move_evaluation = suggestion
        return (self.ask(f"""The current state of the board is as follows in FEN notation: \n  {fen} \n
        The user move is {move_suggestion}. The evaluation of this move by stockfish is {move_evaluation}.\n
        Suggest this move. Try to limit the response to 150 words. Coach the user by providing explanation to the suggestion."""))


    
