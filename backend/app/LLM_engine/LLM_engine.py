from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv  # type: ignore

# Load the environment variables
load_dotenv()

# Get the secret key and stockfish path from the environment variables
SECRET_KEY = os.getenv("SECRET_KEY")


client = InferenceClient(api_key=SECRET_KEY)


# Super class for each agent
class ChatBox:
    def __init__(self):
        self.conversation_history = []
        self.client = InferenceClient(api_key=SECRET_KEY)

    def ask(self, question):
        # Add the new question to the conversation history
        self.conversation_history.append({"role": "user", "content": question})

        # Stream the response
        response = client.text_generation(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            prompt="\n".join(
                [f"{message['role'].capitalize()}: {message['content']}" for message in self.conversation_history]),
        )
        # Add the assistant's response to the conversation history
        self.conversation_history.append(
            {"role": "assistant", "content": response})

        return response

    def reset_memory(self):
        self.conversation_history = []
        pass
