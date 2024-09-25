#!/usr/bin/env python
import json
import os
import click
from sqlalchemy.orm import sessionmaker
from db.models import Base, KeywordMapping
from db.dbconfig import ENGINE

JSON_FILE_PATH = os.path.join(os.path.dirname(__file__), '../db/chapter_keywords.json')

Session = sessionmaker(bind=ENGINE)
session = Session()

def create_tables():
    """Create all tables."""
    Base.metadata.create_all(ENGINE)
    click.echo("All tables created successfully.")
    
    

def insert_keywords_from_json():
    """Insert keywords from JSON file into the database."""
    with open(JSON_FILE_PATH, 'r') as json_file:
        data = json.load(json_file)

        for namespace, keyword_array in data.items():
            keyword_mapping = KeywordMapping(
                namespace=namespace,
                keywordArray=keyword_array
            )
            session.add(keyword_mapping)
        session.commit()
        click.echo("Keywords inserted successfully.")

@click.command()
def initialize_db():
    """Initialize the database and insert keyword data."""
    create_tables()
    insert_keywords_from_json()

if __name__ == "__main__":
    initialize_db()
