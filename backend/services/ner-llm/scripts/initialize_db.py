#!/usr/bin/env python
import json
import os
import click
from sqlalchemy.orm import sessionmaker
from db.models import Base, ManualMapping, KeywordMapping

from db.dbconfig import ENGINE

KEYWORDS_DIR = os.path.join(os.path.dirname(__file__), '../db/keywords')

Session = sessionmaker(bind=ENGINE)
session = Session()

def create_tables():
    # drop tables if exists
    Base.metadata.drop_all(ENGINE)
    
    
    """Create all tables."""
    Base.metadata.create_all(ENGINE)
    click.echo("All tables created successfully.")

def insert_manuals_and_keywords():
    """Insert manuals and keywords from JSON files into the database."""
    for filename in os.listdir(KEYWORDS_DIR):
        if filename.endswith('.json'):
            file_path = os.path.join(KEYWORDS_DIR, filename)
            manual_name = os.path.splitext(filename)[0]  # Remove the .json extension

            with open(file_path, 'r') as json_file:
                data = json.load(json_file)

                # Create a new ManualMapping
                manual_mapping = ManualMapping(manual_name=manual_name)

                for namespace, content in data.items():
                    keywords = content['data'].get('keywords', [])
                    embeddings = content['data'].get('embeddings', [])

                    keyword_mapping = KeywordMapping(
                        namespace=namespace,
                        keywordArray=keywords,
                        keywordEmbeddings=embeddings,
                        manual_mapping=manual_mapping
                    )
                    manual_mapping.keyword_mappings.append(keyword_mapping)

                session.add(manual_mapping)

            session.commit()
            click.echo(f"Manual '{manual_name}' and its keywords inserted successfully.")

if __name__ == "__main__":
    create_tables()
    insert_manuals_and_keywords()
