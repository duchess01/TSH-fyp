#!/usr/bin/env python
"""Run migrations."""
import click

from db.models import Base
from db.dbconfig import ENGINE



def create():
    """Create all tables."""
    Base.metadata.create_all(ENGINE)
    click.echo("All tables created successfully.")



if __name__ == "__main__":
    create()
