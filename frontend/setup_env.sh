#!/bin/bash

# Default values
API_URL="http://localhost:8000/api"
GOOGLE_CLIENT_ID="1016270254180-5odhc9o98c2sqgpvpipku9urjthlrdob.apps.googleusercontent.com"

# Check if production argument is passed
if [ "$1" == "prod" ]; then
    API_URL="https://sistema.qeva.xyz/api"
fi

echo "Creating .env file with API_URL=$API_URL"

# Write to .env file
cat > .env << EOL
VITE_API_URL=$API_URL
VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
EOL

echo ".env file created successfully!"
