from .llm import LLM


class MainCoach(LLM):
    def __init__(self, api_key):
        super().__init__(api_key)
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

    def ask_move_feedback(self,input):
        self.automatic_coach_creation()
        board = input.get("board")
        player = input.get("player")
        move = input.get("move")
        evaluation = input.get("delta_evaluation")
        prompt = (f"""The player who made the move {player},
                        The current state of the board is, empty cells are represented with ' ':\n{board}.
                        The move made is {move},
                        The delta of the two evaluations of the board state, before and after the move: {evaluation}.
                        Provide only a feedback on this move. 
                        Limit the response to 70 words""")
        response = (self.ask(prompt))
        return response
    
    def ask_endgame(self,input):
        self.automatic_coach_creation()
        board = input.get("board")
        player = input.get("player")
        print("Player:"+ player)
        move = input.get("move")
        prompt = (f"""The player who made the move {player},
                        The current state of the board is, empty cells are represented with ' ':\n{board}.
                        The move made is {move}.
                        The player:{player} has won the game. Provide a short congratulations. 
                        Limit the response to 70 words""")
        response = (self.ask(prompt))
        return response

    def ask_move_suggestion(self, input):
        self.automatic_coach_creation()
        board = input.get("board")
        player = input.get("player")
        move = input.get("move")
        evaluation = input.get("delta_evaluation")
        prompt = (f"""The current player is {player},
                        The current state of the board is, empty cells are rapresented with ' ':\n{board}
                        The move to be suggested is: {move},
                        Having the delta of the two evaluations of the board state, before and after the move: {evaluation}.
                        Suggest only this move to the user.
                        Limit the response to 70 words""")
        response = (self.ask(prompt))
        return response

    def ask_chess_question(self, ask_input):
        board = ask_input.get("board")
        player = ask_input.get("player")
        evaluation = ask_input.get("evaluation")
        question = ask_input.get("question")
        first_answer = ask_input.get("first_answer")
        if  not board or not evaluation or not player:
            prompt = (f""" Respond again to the previous question: {question} \n
            give a more detailed explanation compared to the last response: {first_answer}\n
            Limit the response to 70 words\n""")
        else:
            prompt = (f"""The current player is {player},
            The current state of the board is, empty cells are rapresented with ' ':\n{board}
            The evaluation of current board is: {evaluation}.
            {question}
            Limit the response to 70 words""")
        response =  (self.direct_question(prompt))
        return response
    
    def ask_game_status_explanation(self, ask_input):
        self.automatic_coach_creation()
        board = ask_input.get("board")
        player = ask_input.get("player")
        evaluation = ask_input.get("evaluation")
        prompt = (f"""The current player is {player},
                        The current state of the board is, empty cells are rapresented with ' ':\n{board}.
                        The evaluation of current board is: {evaluation}.
                        Provide an explanation on the current status. 
                        Limit the response to 70 words\n""")
        response = (self.ask(prompt))
        return response

    
