import os
from dotenv import load_dotenv

def get_llm_api():
    load_dotenv()
    return os.getenv("LLM_API_KEY")

def is_question_valid(question):
    return isinstance(question, str)
