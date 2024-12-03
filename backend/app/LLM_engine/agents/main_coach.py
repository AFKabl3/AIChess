from ...stockfish_api import StockfishAPI
from .chatbox import ChatBox
import pdb


class MainCoach(ChatBox):
    def __init__(self):
        super().__init__()
        self.automatic_coach_creation()

    def automatic_coach_creation(self):
        self.reset_memory()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
                For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
                Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
                the move you suggested, move sequences, or any general advice they may seek."""
        self.conversation_history.append({"role": "user", "content": self.prompt})
        self.conversation_history.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})

    def ask_move_feedback(self,evaluation):
        self.reset_memory()
        fen, move, move_evaluation = evaluation
        response = (self.ask(f"""The current state of the board is as follows in FEN : \n  {fen} \n
        The move made is {move}. 
        Having the delta of the two evaluations, before and after the move: {move_evaluation}, 
        provide feedback on this move removing all the stockfish references.\n
        Limit the answer to 70 words and Coach the user to correctly understad your answer"""))
        return response

    def ask_move_suggestion(self, suggestion):
        self.reset_memory()
        fen, move_suggestion, move_evaluation = suggestion
        response = (self.ask(f"""The current state of the board is as follows in FEN notation: {fen} \n
        Suggest this move {move_suggestion}, having the delta of the two evaluations, before and after the move: {move_evaluation}.\n
        Limit the answer to 70 words and suggest to the user the move"""))
        return response

    def ask_chess_question(self, fen, question):
        self.reset_memory()
        response =  (self.ask(f"""The current state of the board is as follows in FEN notation: {fen}.\n
        {question}.
        Provide an aswer to the user limite it to 70 words."""))
        return response
