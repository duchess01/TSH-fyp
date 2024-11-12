#!/bin/bash

# Set up environment and app names
AWS_PROFILE="default"
APP_NAME="teamduchess-app"
ENV_NAME="dev"
AWS_REGION="ap-southeast-1"


# Check if the environment manifest exists, if not, create it
if [ ! -f "copilot/environments/$ENV_NAME/manifest.yml" ]; then
    echo "Manifest file for environment $ENV_NAME not found. Generating it..."
    
    # Create the necessary directory for the manifest
    mkdir -p copilot/environments/$ENV_NAME

    # Generate the environment manifest using copilot
    copilot env show -n $ENV_NAME --manifest $ENV_NAME > copilot/environments/$ENV_NAME/manifest.yml
else
    echo "Manifest file for environment $ENV_NAME already exists."
fi

# Initialize AWS Copilot app and environment if not initialized
if [ ! -d "copilot" ]; then
    echo "Initializing AWS Copilot app and environment..."
    copilot app init $APP_NAME
    copilot env init --name $ENV_NAME --profile $AWS_PROFILE --region $AWS_REGION
else
    echo "Copilot app already initialized."
fi

# Deploy the environment (it will create the environment if it doesn't exist)
echo "Deploying the environment $ENV_NAME..."
copilot env deploy --name $ENV_NAME --force

# Deploy each service (replace with your actual service names)
echo "Deploying services..."

# Initialize Copilot app and environment
copilot app init $APP_NAME
copilot env init --name $ENV_NAME --profile $AWS_PROFILE --region $AWS_REGION
copilot env deploy --name $ENV_NAME --force

# Create secrets from .local.env file (if needed) or you can manually add them via CLI as above

# Initialize and deploy services with secrets from Secrets Manager

echo "Deploying services..."
copilot svc init --name user --dockerfile ./services/user/Dockerfile --port 3000 #--env $ENV_NAME
copilot svc deploy --name user #--env $ENV_NAME #--secrets DB_PASSWORD=my-database-secret --secrets PINECONE_API_KEY --secrets OPENAI_API_KEY

copilot svc init --name chat --dockerfile ./services/chat/Dockerfile --port 3001 #--env $ENV_NAME
copilot svc deploy --name chat #--env $ENV_NAME  #--secrets DB_PASSWORD=my-database-secret --secrets PINECONE_API_KEY --secrets OPENAI_API_KEY

copilot svc init --name ner-llm --dockerfile ./services/ner-llm/Dockerfile --port 8000 #--env $ENV_NAME
copilot svc deploy --name ner-llm #--env $ENV_NAME  #--secrets PINECONE_API_KEY --secrets OPENAI_API_KEY

copilot svc init --name upload --dockerfile ./services/upload/Dockerfile --port 8002 #--env $ENV_NAME
copilot svc deploy --name upload #--env $ENV_NAME  #--secrets PINECONE_API_KEY --secrets OPENAI_API_KEY

copilot svc init --name analytics --dockerfile ./services/analytics/Dockerfile --port 3002 #--env $ENV_NAME
copilot svc deploy --name analytics #--env $ENV_NAME #--secrets PINECONE_API_KEY --secrets OPENAI_API_KEY

copilot svc init --name qna --dockerfile ./services/qna/Dockerfile --port 3003 #--env $ENV_NAME
copilot svc deploy --name qna #--env $ENV_NAME #--secrets DB_PASSWORD=my-database-secret --secrets PINECONE_API_KEY --secrets OPENAI_API_KEY

copilot svc init --name langchain --dockerfile ./services/langchain/Dockerfile --port 8001 #--env $ENV_NAME
copilot svc deploy --name langchain #--env $ENV_NAME #--secrets PINECONE_API_KEY --secrets OPENAI_API_KEY --secrets PINECONE_INDEX_NAME



# Ensure that your services are deployed correctly
copilot svc status --name user --env $ENV_NAME
copilot svc status --name chat --env $ENV_NAME
copilot svc status --name ner-llm --env $ENV_NAME
copilot svc status --name upload --env $ENV_NAME
copilot svc status --name analytics --env $ENV_NAME
copilot svc status --name qna --env $ENV_NAME
copilot svc status --name langchain --env $ENV_NAME
