from huggingface_hub import InferenceClient

class LLM:
    def __init__(self, api_key):
        self.automatic_conversation = []
        self.model = "meta-llama/Meta-Llama-3-8B-Instruct"
        # self.model = "mistralai/Mixtral-8x7B-Instruct-v0.1"
        # self.model = "Qwen/QwQ-32B-Preview"
        # self.model = "Qwen/Qwen2.5-Coder-32B-Instruct"
        # self.model = "HuggingFaxceH4/zephyr-7b-beta"
        self.direct_conversation_history = []
        self.client = InferenceClient(api_key=api_key)
        self.max_messages = 5


    def ask(self, question):
        # Stores a maximum of messages and then cleans the older messages so it doesn't store too much data.
        if len(self.automatic_conversation) > self.max_messages:
            self.automatic_conversation = (
                    self.automatic_conversation[:2] + self.automatic_conversation[6:]
            )
        # Add the new question to the conversation history
        self.automatic_conversation.append({"role": "user", "content": question})
        # Stream the response
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=self.automatic_conversation,
            max_tokens=500,
            stream=True
        )
        answer = ""
        for chunk in stream:
            answer += chunk.choices[0].delta.content
        # Add the assistant's response to the conversation history
        self.automatic_conversation.append({"role": "assistant", "content": answer})
        return answer

    def direct_question(self, question):
        # Stores a maximum of messages and then cleans the older messages so it doesn't store too much data.
        if len(self.direct_conversation_history) > self.max_messages:
            self.direct_conversation_history = (
                    self.direct_conversation_history[:2] + self.direct_conversation_history[6:]
            )
        # Add the new question to the conversation history
        self.direct_conversation_history.append({"role": "user", "content": question})
        # Stream the response
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=self.direct_conversation_history,
            max_tokens=500,
            stream=True
        )
        answer = ""
        for chunk in stream:
            answer += chunk.choices[0].delta.content
        # Add the assistant's response to the conversation history
        self.direct_conversation_history.append({"role": "assistant", "content": answer})
        return answer

    def reset_automatic_history(self):
        self.automatic_conversation = []

    def reset_direct_history(self):
        self.direct_conversation_history = []