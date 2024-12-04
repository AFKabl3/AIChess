from http.client import responses

from .chatbox import ChatBox


class MainCoach(ChatBox):
    def __init__(self):
        super().__init__()
        self.automatic_coach_creation()
        self.direct_coach_creation()

    def automatic_coach_creation(self):
        self.reset_automatic_history()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
                For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
                Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
                the move you suggested, move sequences, or any general advice they may seek."""
        self.automatic_conversation.append({"role": "user", "content": self.prompt})
        self.automatic_conversation.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})

    def direct_coach_creation(self):
        self.reset_direct_history()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
                For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
                Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
                the move you suggested, move sequences, or any general advice they may seek."""
        self.direct_conversation_history.append({"role": "user", "content": self.prompt})
        self.direct_conversation_history.append(
            {"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})

    def ask_move_feedback(self,evaluation):
        self.automatic_coach_creation()
        fen, move, move_evaluation = evaluation
        response = (self.ask(f"""The current state of the board is as follows in FEN : \n  {fen} \n
        The move made is {move}. 
        Having the delta of the two evaluations, before and after the move: {move_evaluation}, 
        provide feedback on this move removing all the stockfish references."""))
        return response

    def ask_move_suggestion(self, suggestion):
        self.automatic_coach_creation()
        fen, move_suggestion, move_evaluation = suggestion
        response = (self.ask(f"""The current state of the board is as follows in FEN notation: {fen} \n
        Suggest this move{move_suggestion},  having the delta of the two evaluations, before and after the move: {move_evaluation}.\n"""))
        return response

    def ask_chess_question(self, fen, question, evaluation):
        response =  (self.direct_question(f"""The current state of the board is as follows in FEN notation: {fen} \n
        The evaluation of the state is {evaluation}.\n
        {question}"""))
        return response

    
