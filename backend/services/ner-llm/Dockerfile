FROM python:3.11-slim as base

WORKDIR /usr/src/app

# set the default shell to bash rather than sh
SHELL ["/bin/bash", "-o", "pipefail", "-c"]


# set -eux: exit immediately if a command exits with a non-zero status
# libpq is required for psycopg2
RUN set -eux && \
    apt-get update && \
    apt-get install -y \
      build-essential \
    #   curl \
      libpq-dev \
      python3-dev
    #   libmagic1

COPY requirements.txt requirements.txt

# RUN pip install -r requirements.txt
RUN pip install --no-cache-dir -r requirements.txt


COPY . .



EXPOSE 8000


CMD ["uvicorn", "app.main:app", "--host", ]
# CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0" ]

# RUN ["chmod", "+x", "scripts/entrypoint.sh"]

RUN sed -i 's/\r$//g' ./scripts/entrypoint.sh

ENTRYPOINT ["bash", "./scripts/entrypoint.sh"]


# development staging
FROM base as development