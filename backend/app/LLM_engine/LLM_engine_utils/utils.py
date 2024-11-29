import os
import dotenv

def get_llm_api():
    current_file_path = os.path.abspath(__file__)
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file_path))))
    dotenv_path = os.path.join(backend_path, "env", ".env")
    return dotenv.get_key(dotenv_path=dotenv_path, key_to_get="LLM_API_KEY")
