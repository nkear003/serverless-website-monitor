#!/bin/sh

# Path to the .env file
ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"

# Check if .env file exists
if [ -f "$ENV_FILE" ]; then
  # Copy .env to env.example and remove values after '='
  awk -F '=' '{ print $1 "=" }' "$ENV_FILE" > "$ENV_EXAMPLE_FILE"
  echo ".env.example has been created/updated."
else
  echo ".env file does not exist."
fi
