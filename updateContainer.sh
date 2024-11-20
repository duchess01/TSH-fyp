#!/bin/bash

# Exit on any error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Azure credentials and configuration
AZURE_SUBSCRIPTION_ID="1a4ed35e-fe00-4a7d-84f9-1fcf08db75b1"
AZURE_RESOURCE_GROUP="fyp"
AZURE_REGION="southeastasia"  # e.g., eastus
AZURE_CONTAINER_REGISTRY="ca8419fa7961acr"
AZURE_APP_NAME="fyp-backend"
AZURE_ENVIRONMENT="fyp-backend"
PROD_DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Docker image configuration
export IMAGE_TAG="latest"  # Use timestamp as tag

echo "🚀 Starting Update process..."

# Login to Azure
echo "📝 Logging in to Azure..."
az login

# Set the correct subscription
echo "🔄 Setting Azure subscription..."
az account set --subscription $AZURE_SUBSCRIPTION_ID


# az acr create --resource-group $AZURE_RESOURCE_GROUP --name $AZURE_CONTAINER_REGISTRY --sku Basic --admin-enabled true

# # Get ACR access token
echo "🔑 Getting ACR admin credentials..."
ACR_LOGIN_SERVER="${AZURE_CONTAINER_REGISTRY}.azurecr.io"
ACR_USERNAME=$(az acr credential show -n $AZURE_CONTAINER_REGISTRY --query "username" -o tsv)
ACR_PASSWORD1=$(az acr credential show -n $AZURE_CONTAINER_REGISTRY --query "passwords[0].value" -o tsv)
ACR_PASSWORD2=$(az acr credential show -n $AZURE_CONTAINER_REGISTRY --query "passwords[1].value" -o tsv)


echo $ACR_PASSWORD1
echo $ACR_PASSWORD2
echo $ACR_LOGIN_SERVER
echo $ACR_USERNAME
# Login to ACR using the token
echo "🔑 Logging in to ACR using token..."
# docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME --password-stdin
# Build and tag images using docker-compose
echo "🏗️ Building Docker images..."
cd backend
docker-compose build

# Tag and push images to ACR
echo "📤 Tagging and pushing images to Azure Container Registry..."
services=$(docker-compose config --services)

for service in $services; do

   # Skip database services
    if [[ $service == db_* ]]; then
        echo "Skipping database service: $service"
        continue
    fi

    

    echo "Processing service: $service"
    
    # Get the full image name including tag
    image_name="teamduchess/${service}:latest"
    
    # Tag the image for ACR
    acr_image="$AZURE_CONTAINER_REGISTRY.azurecr.io/${service}:$IMAGE_TAG"
    echo "Tagging $image_name as $acr_image"
    
    docker tag $image_name $acr_image
    
    # Push to ACR
    echo "Pushing $service to ACR..."
    docker push $acr_image
done



SERVER_NAME="fyp-postgres"
ADMIN_USER="postgres"
ADMIN_PASSWORD="FezP%2P1OTEn#"  # Change this!
SKU="B_Gen5_1"



# Get the server FQDN
SERVER_FQDN=$(az postgres server show \
    --resource-group $AZURE_RESOURCE_GROUP \
    --name $SERVER_NAME \
    --query fullyQualifiedDomainName \
    --output tsv)

# Export database environment variables
export AZURE_POSTGRES_HOST=$SERVER_FQDN
export AZURE_POSTGRES_USER="${ADMIN_USER}@${SERVER_NAME}"
export AZURE_POSTGRES_PASSWORD=$ADMIN_PASSWORD
export AZURE_USER_DB_NAME=user_db
export AZURE_CHAT_DB_NAME=chat_db
export AZURE_NER_DB_NAME=ner_db
export AZURE_QNA_DB_NAME=qna_db


# Get admin credentials
echo "🔑 Getting ACR admin credentials..."
ACR_LOGIN_SERVER="${AZURE_CONTAINER_REGISTRY}.azurecr.io"
ACR_USERNAME=$(az acr credential show -n $AZURE_CONTAINER_REGISTRY --query "username" -o tsv)
ACR_PASSWORD1=$(az acr credential show -n $AZURE_CONTAINER_REGISTRY --query "passwords[0].value" -o tsv)
ACR_PASSWORD2=$(az acr credential show -n $AZURE_CONTAINER_REGISTRY --query "passwords[1].value" -o tsv)

# Try login with first password
echo "🔒 Trying login with password 1..."
echo $ACR_PASSWORD1 | docker login $ACR_LOGIN_SERVER --username $ACR_USERNAME --password-stdin

# If first password fails, try second password
if [ $? -ne 0 ]; then
    echo "⚠️ First password failed, trying password 2..."
    echo $ACR_PASSWORD2 | docker login $ACR_LOGIN_SERVER --username $ACR_USERNAME --password-stdin
fi







# List repositories to verify images
echo "📋 Verifying images in ACR..."
az acr repository list --name $AZURE_CONTAINER_REGISTRY --output table


# Deploy all services to Container Apps
echo "🚀 Updating services to Container Apps..."

# Deploy User service
echo "📱 Updating User service..."
az containerapp update \
    --name "$AZURE_APP_NAME-user" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/user:${IMAGE_TAG}"
# Deploy Chat service
echo "💬 Updating Chat service..."
az containerapp update \
    --name "$AZURE_APP_NAME-chat" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/chat:${IMAGE_TAG}"

        

# Deploy NER-LLM service
echo "🤖 Updating NER-LLM service..."
az containerapp update \
    --name "$AZURE_APP_NAME-ner-llm" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/ner-llm:${IMAGE_TAG}"

# Deploy Upload service
echo "📤 Updating Upload service..."
az containerapp update \
    --name "$AZURE_APP_NAME-upload" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/upload:${IMAGE_TAG}"

# Deploy Analytics service
echo "📊 Updating Analytics service..."
az containerapp update \
    --name "$AZURE_APP_NAME-analytics" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/analytics:${IMAGE_TAG}"

# Deploy QnA service
echo "❓ Updating QnA service..."
az containerapp update \
    --name "$AZURE_APP_NAME-qna" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/qna:${IMAGE_TAG}"

# Deploy Langchain service
echo "🔗 Updating Langchain service..."
az containerapp update \
    --name "$AZURE_APP_NAME-langchain" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/langchain:${IMAGE_TAG}" \


