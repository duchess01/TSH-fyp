import requests
from constants.constants import ENVIRONMENT


class ChatService:
    def __init__(self):
        if ENVIRONMENT == 'production':
            self.base_url = 'http://chat:3001/api/v1/chat'
        else:
            self.base_url = 'http://localhost:3001/api/v1/chat'

    def get_chat_history(self, user_id: int, chat_session_id: int):

        url = f'{self.base_url}/history'
        params = {
            'userId': user_id,
            'chatSessionId': chat_session_id
        }
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()  # Raise an error for bad status codes

            if response.text == '':
                return ""

            chat_history = response.json()
            return self._format_chat_history(chat_history)
        except requests.exceptions.RequestException as e:
            print(f'An error occurred: {e}')
            return None

    def _format_chat_history(self, chat_history):
        formatted_history = ""
        for entry in chat_history:
            question = entry["message"]
            answer = entry["response"]
            formatted_history += f"question: '{question}'\nanswer: `{answer}`\n"
        return formatted_history.strip()
