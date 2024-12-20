#!/bin/bash



# ensures that errors are caught and that the script exits if one occurs

# -e command failure exits the script
# -u unbound variables are errors
# -x print each command before executing it, for debugging
# -o pipefail : fails the entire pipeline if any command fails
set -euxo pipefail

cd upload



echo "current working directory : $(pwd)"

uvicorn server.main:app --host 0.0.0.0 --port 8002 --reload