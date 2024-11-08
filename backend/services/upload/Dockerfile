FROM python:3.10.6-slim as base

WORKDIR /usr/src/app

# set the default shell to bash rather than sh
SHELL ["/bin/bash", "-o", "pipefail", "-c"]


# set -eux: exit immediately if a command exits with a non-zero status
# libpq is required for psycopg2
RUN set -eux && \
    apt-get update && \
    apt-get install -y \
      build-essential \
      dos2unix\
    #   curl \
      libpq-dev \
      python3-dev
    #   libmagic1

COPY requirements.txt requirements.txt


# RUN pip install -r requirements.txt
RUN pip install --no-cache-dir -r requirements.txt


COPY . ./upload



EXPOSE 8002


CMD ["uvicorn", "app.main:app", "--host", ]
# CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0" ]

# RUN ["chmod", "+x", "scripts/entrypoint.sh"]

RUN dos2unix ./upload/scripts/entrypoint.sh


RUN chmod +x ./upload/scripts/entrypoint.sh




# development staging
FROM base as development


ENTRYPOINT ["bash", "./upload/scripts/entrypoint.sh"]

# testing staging

# FROM base as testing

# RUN pip install --no-cache-dir pytest pytest-cov pytest-asyncio

# ENTRYPOINT ["bash", "./ner-llm/scripts/test_entrypoint.sh"]
