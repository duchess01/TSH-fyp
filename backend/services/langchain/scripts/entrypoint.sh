#!/bin/bash

set -euxo pipefail



fastapi dev main.py --port 8001 


echo "current working directory : $(pwd)"

uvicorn server.main:app --host 0.0.0.0 --port 8001 --reload