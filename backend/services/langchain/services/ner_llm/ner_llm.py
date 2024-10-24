from constants.constants import ENVIRONMENT
import requests


class NerLLMService:
    def __init__(self):
        if ENVIRONMENT == 'docker':
            self.base_url = 'http://ner-llm:8000'
        else:
            self.base_url = 'http://localhost:8000'

    def get_keyword_mapping(self, machine:str):
        url = f'{self.base_url}/manual/get/{machine}'
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an error for bad status codes
            data = response.json()["data"]
            res = []
            for chapter in data:
                embedding = chapter["keywordEmbeddings"]
                res.append((embedding, chapter["namespace"]))
            return res

        except requests.exceptions.RequestException as e:
            print(f'An error occurred calling NER LLM service: {e}')
            return None
