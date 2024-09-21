import json
import os
import sys

import requests
from manual_content import manual_dictionary

BASE_URL = "http://localhost:8000"

def extract_keywords(content):
    url = f"{BASE_URL}/extractkeywords"
    payload = {
        "text": content,
        "model_name": "gpt-4o",
        "chunking": False,
        "chunk_size": 300,
        "keyword_count": 30
    }
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        response_data = response.json()
        if response_data.get("status_code") == 200:
            keywords = response_data["data"]["keywords"]
            return keywords
        else:
            print(f"Error: {response_data.get('message')}")
            return None
    else:
        print(f"Request failed with status code {response.status_code}")
        return None
    
def embed_keywords(keywords):
    url = f"{BASE_URL}/embedkeywords"
    payload = {
        "text": keywords,
        "model_name": "text-embedding-ada-002"
    }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        response_data = response.json()
        if response_data.get("status_code") == 200:
            embeddings = response_data["data"]
            return embeddings
        else:
            print(f"Error: {response_data.get('message')}")
            return None

def store_keywords(heading, keywords):
    url = f"{BASE_URL}/keywords"
    payload = {
        "keywordArray": [
            {heading: keywords}
        ]
    }
    response = requests.post(url, json=payload)
    return response.status_code

def process_headings(headings_dict):
    output = {}
    for heading, content_list in headings_dict.items():
        content = " ".join(content_list) + heading

        keywords = extract_keywords(json.dumps(content))
        keywords.append(heading)
        keywords_content = " ".join(keywords)
        embeddings = embed_keywords(json.dumps(keywords_content))

        if keywords and embeddings:
            output[heading] = {
            "data": {
                "keywords": keywords,
                "embeddings": embeddings
            }
        }
            
    return output
        

def save_output_to_file(output_dict, filename="chapter_keywords.json"):
    folder_path = os.path.join(os.path.dirname(__file__), '..', 'db/keywords')
    file_path = os.path.join(folder_path, filename)

    with open(file_path, 'w') as f:
        json.dump(output_dict, f, indent=4)
    print(f"Output saved to {file_path}")


if __name__ == "__main__":
    processed_output = process_headings(manual_dictionary)

    for heading, data in processed_output.items():
        keywords = data["data"]["keywords"]
        print(f"Heading: {heading}, Keyword Size: {len(keywords)}")

    save_output_to_file(processed_output)


