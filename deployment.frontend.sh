cd frontend

npm i -g @azure/static-web-apps-cli

touch .env.prod

npm run build

swa deploy ./dist --app-name fyp-frontend --resource-group fyp



echo "Deploying frontend..."
sleep 30


# Add environment variables from .env.prod
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || $key == \#* ]] && continue
    # Remove any surrounding quotes from the value
    value=$(echo $value | sed -e 's/^"//' -e 's/"$//')
    az staticwebapp appsettings set \
        --name "fyp-frontend" \
        --resource-group "fyp" \
        --setting-names "$key=$value"
done < .env.prod

