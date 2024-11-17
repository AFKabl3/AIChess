from app.stockfish_api import Stockfish
from .chatbox import ChatBox
import pdb


class MainCoach(ChatBox):
    def __init__(self,player_color="w"):
        super().__init__()
        self.player_color = player_color
       
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
        For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
        Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
        the move you suggested, move sequences, or any general advice they may seek."""
        self.conversation_history.append({"role": "user", "content": self.prompt})
        self.conversation_history.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})
        self.stockfish = Stockfish(depth=10)

    def ask_move_feedback(self,move,fen):
        # pdb.set_trace()
        evaluation = self.stockfish.evaluate_move_score(fen,move,player_color=self.player_color)
        return (self.ask(f"""The current state of the board is as follows in FEN notation: \n  {fen} \n
        The user move is {move}. The evaluation of this move by stockfish is {evaluation}.\n
        Provide feedback on this move. Try to limit the response to 150 words. Coach the user by providing explanation to the evaluation."""))
        
    def ask_chess_question(self, fen, question):
        evaluation = self.stockfish.get_evaluation(fen)
        return (self.ask(f"""The current state of the board is as follows in FEN notation: \n  {fen} \n
        The user question is {question}. The evaluation of this state by stockfish is {evaluation}.\n
        Provide a valid answer for this question in a chess context. Try to limit the response to 150 words."""))
        
    


    
