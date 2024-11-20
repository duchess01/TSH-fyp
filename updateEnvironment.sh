# Exit on any error
set -e

az login



# Azure credentials and configuration
AZURE_SUBSCRIPTION_ID="1a4ed35e-fe00-4a7d-84f9-1fcf08db75b1"
AZURE_RESOURCE_GROUP="fyp"
AZURE_REGION="southeastasia"  # e.g., eastus
AZURE_CONTAINER_REGISTRY="ca8419fa7961acr"
AZURE_APP_NAME="fyp-backend"
AZURE_ENVIRONMENT="fyp-backend"
PROD_DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "🔧 Setting up Azure PostgreSQL..."
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

# Database names
DATABASES=(
    "user_db"
    "chat_db"
    "ner_db"
    "qna_db"
)
# Export database environment variables
export AZURE_POSTGRES_HOST=$SERVER_FQDN
export AZURE_POSTGRES_USER="${ADMIN_USER}@${SERVER_NAME}"
export AZURE_POSTGRES_PASSWORD=$ADMIN_PASSWORD
export AZURE_USER_DB_NAME=user_db
export AZURE_CHAT_DB_NAME=chat_db
export AZURE_NER_DB_NAME=ner_db
export AZURE_QNA_DB_NAME=qna_db

# Update User service env vars
echo "📱 Updating User service environment variables..."
az containerapp update \
    --name "$AZURE_APP_NAME-user" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars \
        DB_HOST_DOCKER="${AZURE_POSTGRES_HOST}" \
        DB_PORT_DOCKER="5432" \
        DB_NAME_DOCKER="${AZURE_USER_DB_NAME}" \
        DB_USER_DOCKER="${AZURE_POSTGRES_USER}" \
        DB_PASSWORD_DOCKER="${AZURE_POSTGRES_PASSWORD}" \
        DOCKER_ENV="true" \
        ENVIRONMENT="production"

# Update Chat service env vars
echo "💬 Updating Chat service environment variables..."
az containerapp update \
    --name "$AZURE_APP_NAME-chat" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars \
        DB_HOST_DOCKER="${AZURE_POSTGRES_HOST}" \
        DB_PORT_DOCKER="5432" \
        DB_NAME_DOCKER="${AZURE_CHAT_DB_NAME}" \
        DB_USER_DOCKER="${AZURE_POSTGRES_USER}" \
        DB_PASSWORD_DOCKER="${AZURE_POSTGRES_PASSWORD}" \
        DOCKER_ENV="true"

# Update NER-LLM service env vars
echo "🤖 Updating NER-LLM service environment variables..."
az containerapp update \
    --name "$AZURE_APP_NAME-ner-llm" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars \
        PG_HOST="${AZURE_POSTGRES_HOST}" \
        PG_PORT="5432" \
        PG_DATABASE="${AZURE_NER_DB_NAME}" \
        PG_USER="${AZURE_POSTGRES_USER}" \
        PG_PASSWORD="${AZURE_POSTGRES_PASSWORD}"

# Update Upload service env vars
echo "📤 Updating Upload service environment variables..."
az containerapp update \
    --name "$AZURE_APP_NAME-upload" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars \
        NER_LLM_URL="https://${AZURE_APP_NAME}-ner-llm.azurecontainerapps.io" \
        DOCKER_ENV="true"

# Update Analytics service env vars
echo "📊 Updating Analytics service environment variables..."
az containerapp update \
    --name "$AZURE_APP_NAME-analytics" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars \
        DOCKER_ENV="true" \
        NODE_ENV="production" \
        CHAT_SERVICE_URL="https://${AZURE_APP_NAME}-chat.azurecontainerapps.io"

# Update QnA service env vars
echo "❓ Updating QnA service environment variables..."
az containerapp update \
    --name "$AZURE_APP_NAME-qna" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars \
        DB_HOST_DOCKER="${AZURE_POSTGRES_HOST}" \
        DB_PORT_DOCKER="5432" \
        DB_NAME_DOCKER="${AZURE_QNA_DB_NAME}" \
        DB_USER_DOCKER="${AZURE_POSTGRES_USER}" \
        DB_PASSWORD_DOCKER="${AZURE_POSTGRES_PASSWORD}" \
        DOCKER_ENV="true"

# Update Langchain service env vars
echo "🔗 Updating Langchain service environment variables..."
az containerapp update \
    --name "$AZURE_APP_NAME-langchain" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars \
        ENVIRONMENT="docker"

echo "✅ All environment variables updated successfully!"