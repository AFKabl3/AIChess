from .llm import LLM


class MainCoach(LLM):
    def __init__(self, api_key):
        super().__init__(api_key)
        self.automatic_coach_creation()

    def automatic_coach_creation(self):
        self.reset_automatic_history()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
                            For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
                            Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
                            the move you suggested, move sequences, or any general advice they may seek."""
        self.automatic_conversation.append({"role": "user", "content": self.prompt})
        self.automatic_conversation.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})

    def ask_move_feedback(self,input):
        self.automatic_coach_creation()
        board = input.get("board")
        player = input.get("player")
        move = input.get("move")
        winning_percentage = input.get("winning_percentage")
        evaluation = input.get("delta_evaluation")
        prompt = (f"""The current state of the board is, empty cells are represented with ' ':\n{board}.
                        The {player} player made {move}, with an evaluation of {evaluation}.
                        Winning probability is {winning_percentage}%.
                        Provide only a feedback on this move. 
                        Limit the response to 70 words""")
        response = (self.ask(prompt))
        return response
    
    def ask_endgame(self,input):
        self.automatic_coach_creation()
        board = input.get("board")
        player = input.get("player")
        move = input.get("move")
        type = input.get("type")
        prompt = (f"""Board state, empty cells are represented with ' ':\n{board}.
                        The {player} leads a game to a {type}. 
                        The move made is {move}.
                        Explain the move and provide a congratulations. 
                        Limit the response to 70 words""")
        response = (self.ask(prompt))
        return response
    
    def move_suggestion_endgame(self, input):
        self.automatic_coach_creation()
        board = input.get("board")
        player = input.get("player")
        move = input.get("move")
        # winning_percentage = input.get("winning_percentage")
        
        prompt = (f"""The current player is {player}.
                        Board state, empty cells are rapresented with ' ':\n{board}
                        Stockfish best move {move}, which leads to checkmate. 
                        Reccomend this move to the user.
                        Limit the response to 70 words""")
        
        response = (self.ask(prompt))
        return response

    def ask_move_suggestion(self, input):
        self.automatic_coach_creation()
        board = input.get("board")
        player = input.get("player")
        move = input.get("move")
        evaluation = input.get("delta_evaluation")
        winning_percentage = input.get("winning_percentage")
        
        prompt = (f"""The current player is {player}.
                        Board state, empty cells are rapresented with ' ':\n{board}
                        Stockfish suggests the best move: {move}, with an evaluation of {evaluation}.
                        Winning probability after this move is {winning_percentage}%.
                        Recommend this move to the user.
                        Limit the response to 70 words""")
        response = (self.ask(prompt))
        return response
    
    def ask_more_explanation(self, ask_input):
        question = ask_input.get("question")
        first_answer = ask_input.get("first_answer")

        prompt = (f"""Respond again to the previous question: {question} \n
                        give a more detailed explanation compared to the last response: {first_answer}\n
                        Limit the response to 70 words\n""")
        response =  (self.ask(prompt))
        return response
    
    def ask_game_status_explanation(self, ask_input):
        self.automatic_coach_creation()
        board = ask_input.get("board")
        player = ask_input.get("player")
        winning_percentage = ask_input.get("winning_percentage")
        
        prompt = (f"""The current player is {player}.
                        Board state, empty cells are rapresented with ' ':\n{board}
                        Winning probability of the current player: {winning_percentage}%.
                        Explanation on the status of the current player. 
                        Limit the response to 70 words\n""")
        response = (self.ask(prompt))
        return response


