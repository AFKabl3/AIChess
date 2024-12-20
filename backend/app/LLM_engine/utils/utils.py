import os
import numpy as np
from dotenv import load_dotenv

def get_llm_api():
    load_dotenv()
    return os.getenv("LLM_API_KEY")

def is_question_valid(question):
    return isinstance(question, str)

def get_string_board(fen):
    return fen.split()[0]

def from_fen_to_board(fen):
    board = get_string_board(fen)
    matrixboard = [[' ' for _ in range(8)] for _ in range(8)]
    # matrixboard = np.zeros((8,8))
    rows = board.split('/')
    for i, row in enumerate(rows):
        col = 0
        for char in row:
            if char.isdigit():
                col += int(char)
            else:
                matrixboard[i][col] = char
                col += 1
    return matrixboard