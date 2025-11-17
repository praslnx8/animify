#!/bin/bash
set -e

git checkout cred
mv .env.sample .env

# Install packages without asking
sudo yum install -y npm

# Install dependencies
npm install

# Kill old screen session if exists
if screen -list | grep -q "myapp"; then
    screen -S myapp -X quit
fi

# Start the app in a new detached screen
screen -dmS myapp bash -c "npm run dev"

echo "App started in screen session 'myapp'"
echo "Use: screen -r myapp   to see logs"
