import os

def get_llm_api():
    current_file_path = os.path.abspath(__file__)
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file_path))))
    dotenv_path = os.path.join(backend_path, "env", ".env")

    with open(dotenv_path, 'r') as file:
        lines = file.read().split("\n")
        for line in lines:
            env_var = line.split("=")
            if env_var[0] == 'LLM_API_KEY':
                return env_var[1]