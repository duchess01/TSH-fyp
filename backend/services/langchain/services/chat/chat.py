import requests
from constants.constants import ENVIRONMENT


class ChatService:
    def __init__(self):
        if ENVIRONMENT == 'docker':
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
                return "", None

            chat_history = response.json()
            return self._format_chat_history(chat_history)
        except requests.exceptions.RequestException as e:
            print(f'An error occurred calling Chat service: {e}')
            return "", "others"

    def _format_chat_history(self, chat_history):
        formatted_history = ""
        latest_topic = "others"
        for entry in chat_history:
            question = entry["message"]
            answer = entry["response"]
            topic = entry["topic"]
            formatted_history += f"question: '{question}'\nanswer: `{answer}`\n"
            latest_topic = topic
        return formatted_history.strip(), latest_topic
