import os
import dotenv
from dotenv import load_dotenv

def get_llm_api():
    load_dotenv()
    return os.getenv("LLM_API_KEY")
