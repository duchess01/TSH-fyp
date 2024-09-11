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
        "model_name": "gpt-3.5-turbo",
        "chunking": True,
        "chunk_size": 300
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
        
        keywords = extract_keywords(content)

        if keywords:
            output[heading] = keywords
    return output
        

def save_output_to_file(output_dict, filename="chapter_keywords.json"):
    folder_path = os.path.join(os.path.dirname(__file__), '..', 'db')
    file_path = os.path.join(folder_path, filename)

    with open(file_path, 'w') as f:
        json.dump(output_dict, f, indent=4)
    print(f"Output saved to {file_path}")


if __name__ == "__main__":
    processed_output = process_headings(manual_dictionary)
    save_output_to_file(processed_output)


