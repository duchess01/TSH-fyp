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

echo "🚀 Starting deployment process..."

# Login to Azure
echo "📝 Logging in to Azure..."
az login

# Set the correct subscription
echo "🔄 Setting Azure subscription..."
az account set --subscription $AZURE_SUBSCRIPTION_ID

# Create Container Apps environment if it doesn't exist
# echo "🌍 Creating/Checking Container Apps environment..."
# az containerapp env create \
#     --name "$AZURE_ENVIRONMENT" \
#     --resource-group "$AZURE_RESOURCE_GROUP" \
#     --location "$AZURE_REGION"

# Get ACR access token
echo "🔑 Getting ACR access token..."
ACR_TOKEN=$(az acr login -n $AZURE_CONTAINER_REGISTRY --expose-token --output tsv --query accessToken)
ACR_LOGIN_SERVER=$(az acr show -n $AZURE_CONTAINER_REGISTRY --query loginServer -o tsv)

# Login to ACR using the token
echo "🔑 Logging in to ACR using token..."
docker login $ACR_LOGIN_SERVER -u 00000000-0000-0000-0000-000000000000 -p $ACR_TOKEN

# Build and tag images using docker-compose
echo "🏗️ Building Docker images..."
cd backend
docker-compose build

# Tag and push images to ACR
echo "📤 Tagging and pushing images to Azure Container Registry..."
services=$(docker-compose config --services)

for service in $services; do

   # Skip database services
    if [[ $service == db-* ]]; then
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


# Deploy to Azure Container Apps
# Deploy to Azure Container Apps
echo "🚀 Deploying to Azure Container Apps..."
# services=$(docker-compose config --services)
# for service in $services; do
#     # Skip database services
#     if [[ $service == db-* ]]; then
#         echo "Skipping database service: $service"
#         continue
#     fi
    
#     echo "Deploying $service..."
    
#     # Get the port from docker-compose.yml
#     port=$(docker-compose config | grep -A 10 "  $service:" | grep -m 1 "ports:" -A 1 | grep -o '"[0-9]*:' | cut -d'"' -f2 | cut -d':' -f1)
    
#     if [ -z "$port" ]; then
#         echo "⚠️ No port found for $service, using default port 8000"
#         port=8000
#     fi
    
#     echo "📍 Using port $port for $service"
    
#     # Create or update Container App
#     az containerapp create \
#         --name "$AZURE_APP_NAME-$service" \
#         --resource-group $AZURE_RESOURCE_GROUP \
#         --image "$ACR_LOGIN_SERVER/${service}:${DEPLOY_TAG}" \
#         --registry-server "$ACR_LOGIN_SERVER" \
#         --target-port "$port" \
#         --ingress external \
#         --min-replicas 1 \
#         --max-replicas 3 \
#         --env-vars "DOCKER_REGISTRY=$ACR_LOGIN_SERVER"
# done

# echo "✅ Deployment completed successfully!"

echo "🔧 Setting up Azure PostgreSQL..."
SERVER_NAME="fyp-postgres"
ADMIN_USER="postgres"
ADMIN_PASSWORD="FezP%2P1OTEn#"  # Change this!
SKU="B_Gen5_1"

# Database names
DATABASES=(
    "user_db"
    "chat_db"
    "ner_db"
    "qna_db"
)

# Create PostgreSQL server if it doesn't exist
if ! az postgres server show --name $SERVER_NAME --resource-group $AZURE_RESOURCE_GROUP &> /dev/null; then
    echo "🔧 Creating PostgreSQL server..."
    az postgres server create \
        --name $SERVER_NAME \
        --resource-group $AZURE_RESOURCE_GROUP \
        --location $AZURE_REGION \
        --admin-user $ADMIN_USER \
        --admin-password $ADMIN_PASSWORD \
        --sku-name $SKU \
        --version 11

    # Configure firewall to allow Azure services
    echo "🔒 Configuring firewall rules..."
    az postgres server firewall-rule create \
        --resource-group $AZURE_RESOURCE_GROUP \
        --server-name $SERVER_NAME \
        --name AllowAllAzureIPs \
        --start-ip-address 0.0.0.0 \
        --end-ip-address 255.255.255.255
else
    echo "✅ PostgreSQL server already exists"
fi

# Create databases if they don't exist
for db in "${DATABASES[@]}"; do
    if ! az postgres db show --name $db --resource-group $AZURE_RESOURCE_GROUP --server-name $SERVER_NAME &> /dev/null; then
        echo "📚 Creating database: $db"
        az postgres db create \
            --resource-group $AZURE_RESOURCE_GROUP \
            --server-name $SERVER_NAME \
            --name $db
    else
        echo "✅ Database $db already exists"
    fi
done

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

echo "✨ Database setup completed!"
echo "Server FQDN: $SERVER_FQDN"

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

# for env copy it from .local.env under /backend
echo "📝 Creating production environment file..."
if [ -f .local.env ]; then
    # Copy .local.env to a new file
    cp .local.env .prod.env
    
    # Append or update ACR and database variables
    cat << EOF >> .prod.env
# Azure Container Registry
ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER
IMAGE_TAG=$IMAGE_TAG

# Azure Configuration
AZURE_APP_NAME=$AZURE_APP_NAME
EOF

    echo "✅ Production environment file created at backend/.prod.env"
else
    echo "❌ Error: backend/.local.env file not found!"
    exit 1
fi



# List repositories to verify images
echo "📋 Verifying images in ACR..."
az acr repository list --name $AZURE_CONTAINER_REGISTRY --output table

# ... (your existing script) ...

# Deploy all services to Container Apps
echo "🚀 Deploying services to Container Apps..."

# Deploy User service
echo "📱 Deploying User service..."
az container create \
    --name "$AZURE_APP_NAME-user" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_ENVIRONMENT" \
    --image "$ACR_LOGIN_SERVER/user:${IMAGE_TAG}" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD1" \
    --target-port 3000 \
    --environment-variables \
        "PG_HOST=${AZURE_POSTGRES_HOST}" \
        "PG_PORT=5432" \
        "PG_DATABASE=${AZURE_USER_DB_NAME}" \
        "PG_USER=${AZURE_POSTGRES_USER}" \
        "PG_PASSWORD=${AZURE_POSTGRES_PASSWORD}" \
        "DOCKER_ENV=true"

# Deploy Chat service
echo "💬 Deploying Chat service..."
az container create \
    --name "$AZURE_APP_NAME-chat" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_ENVIRONMENT" \
    --image "$ACR_LOGIN_SERVER/chat:${IMAGE_TAG}" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD1" \
    --target-port 3001 \
    --environment-variables \
        "DB_HOST=${AZURE_POSTGRES_HOST}" \
        "DB_PORT=5432" \
        "DB_NAME=${AZURE_CHAT_DB_NAME}" \
        "DB_USER=${AZURE_POSTGRES_USER}" \
        "DB_PASSWORD=${AZURE_POSTGRES_PASSWORD}" \
        "DOCKER_ENV=true"

# Deploy NER-LLM service
echo "🤖 Deploying NER-LLM service..."
az container create \
    --name "$AZURE_APP_NAME-ner-llm" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_ENVIRONMENT" \
    --image "$ACR_LOGIN_SERVER/ner-llm:${IMAGE_TAG}" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD1" \
    --target-port 8000 \
    --environment-variables \
        "PG_HOST=${AZURE_POSTGRES_HOST}" \
        "PG_PORT=5432" \
        "PG_DATABASE=${AZURE_NER_DB_NAME}" \
        "PG_USER=${AZURE_POSTGRES_USER}" \
        "PG_PASSWORD=${AZURE_POSTGRES_PASSWORD}" \
        "CORS_ORIGINS=${ALLOWED_ORIGINS}"

# Deploy Upload service
echo "📤 Deploying Upload service..."
az container create \
    --name "$AZURE_APP_NAME-upload" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_ENVIRONMENT" \
    --image "$ACR_LOGIN_SERVER/upload:${IMAGE_TAG}" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD1" \
    --target-port 8002 \
    --environment-variables \
        "NER_LLM_URL=https://${AZURE_APP_NAME}-ner-llm.azurecontainerapps.io" \
        "DOCKER_ENV=true"

# Deploy Analytics service
echo "📊 Deploying Analytics service..."
az container create \
    --name "$AZURE_APP_NAME-analytics" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_ENVIRONMENT" \
    --image "$ACR_LOGIN_SERVER/analytics:${IMAGE_TAG}" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD1" \
    --target-port 3002 \
    --environment-variables "DOCKER_ENV=true"

# Deploy QnA service
echo "❓ Deploying QnA service..."
az container create \
    --name "$AZURE_APP_NAME-qna" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_ENVIRONMENT" \
    --image "$ACR_LOGIN_SERVER/qna:${IMAGE_TAG}" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD1" \
    --target-port 3003 \
    --environment-variables \
        "DB_HOST=${AZURE_POSTGRES_HOST}" \
        "DB_PORT=5432" \
        "DB_NAME=${AZURE_QNA_DB_NAME}" \
        "DB_USER=${AZURE_POSTGRES_USER}" \
        "DB_PASSWORD=${AZURE_POSTGRES_PASSWORD}" \
        "DOCKER_ENV=true"

# Deploy Langchain service
echo "🔗 Deploying Langchain service..."
az container create \
    --name "$AZURE_APP_NAME-langchain" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_ENVIRONMENT" \
    --image "$ACR_LOGIN_SERVER/langchain:${IMAGE_TAG}" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD1" \
    --target-port 8001 \
    --environment-variables "ENVIRONMENT=docker"

# Get all service URLs
echo "🌐 Getting service URLs..."
for service in user chat ner-llm upload analytics qna langchain; do
    URL=$(az containerapp show \
        --name "$AZURE_APP_NAME-$service" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --query "properties.configuration.ingress.fqdn" -o tsv)
    echo "$service URL: https://$URL"
done

echo "✅ Deployment completed successfully!"