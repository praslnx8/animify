#!/bin/bash
set -e

# Move .env.sample to .env only if .env does not exist
if [ ! -f .env ]; then
    mv .env.sample .env
else
    echo ".env already exists, skipping move."
fi

# Install npm only if not already installed
if ! command -v npm >/dev/null 2>&1; then
    sudo yum install -y npm
else
    echo "npm is already installed, skipping installation."
fi

# Always install dependencies to ensure updates are applied
echo "Running npm install to ensure dependencies are up to date."
npm install

# Always run build to ensure latest code is built
echo "Running npm run build to ensure latest code is built."
npm run build

# Start the app in a new detached screen only if not already running
if screen -list | grep -q "myapp"; then
    echo "Screen session 'myapp' already running, skipping start."
else
    screen -dmS myapp bash -c "npm start"
    echo "App started in screen session 'myapp'"
    echo "Use: screen -r myapp   to see logs"
fi
