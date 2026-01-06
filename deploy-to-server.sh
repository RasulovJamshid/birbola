#!/bin/bash

# Remote deployment script for birbola.uz
# This script deploys from your local machine to the remote server
# Usage: ./deploy-to-server.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration - UPDATE THESE VALUES
SERVER_USER="your-username"
SERVER_HOST="your-server-ip"
SERVER_PATH="/opt/birbola-frontend"
SSH_KEY="" # Optional: path to SSH key, e.g., ~/.ssh/id_rsa

echo -e "${GREEN}=== Birbola.uz Remote Deployment ===${NC}\n"

# Validate configuration
if [ "$SERVER_USER" = "your-username" ] || [ "$SERVER_HOST" = "your-server-ip" ]; then
    echo -e "${RED}Error: Please update SERVER_USER and SERVER_HOST in this script${NC}"
    exit 1
fi

# Build SSH command
SSH_CMD="ssh"
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
fi

SCP_CMD="scp"
if [ -n "$SSH_KEY" ]; then
    SCP_CMD="scp -i $SSH_KEY"
fi

# Step 1: Build locally (optional, comment out if you want to build on server)
echo -e "${YELLOW}Building project locally...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed${NC}\n"

# Step 2: Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="birbola-deploy-${TIMESTAMP}.tar.gz"

tar -czf "$PACKAGE_NAME" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.env.local \
    --exclude=*.tar.gz \
    --exclude=.DS_Store \
    .

echo -e "${GREEN}✓ Package created: ${PACKAGE_NAME}${NC}\n"

# Step 3: Upload to server
echo -e "${YELLOW}Uploading to server...${NC}"
$SCP_CMD "$PACKAGE_NAME" "${SERVER_USER}@${SERVER_HOST}:/tmp/"
echo -e "${GREEN}✓ Upload completed${NC}\n"

# Step 4: Deploy on server
echo -e "${YELLOW}Deploying on server...${NC}"
$SSH_CMD "${SERVER_USER}@${SERVER_HOST}" << EOF
    set -e
    
    # Create directory if it doesn't exist
    sudo mkdir -p ${SERVER_PATH}
    
    # Backup existing deployment
    if [ -d "${SERVER_PATH}/dist" ]; then
        echo "Creating backup..."
        sudo mv ${SERVER_PATH}/dist ${SERVER_PATH}/dist.backup.\$(date +%Y%m%d_%H%M%S) || true
    fi
    
    # Extract new files
    echo "Extracting files..."
    cd ${SERVER_PATH}
    sudo tar -xzf /tmp/${PACKAGE_NAME}
    
    # Set permissions
    sudo chown -R \$USER:\$USER ${SERVER_PATH}
    
    # Stop existing container
    echo "Stopping existing container..."
    cd ${SERVER_PATH}
    docker-compose down || true
    
    # Build and start new container
    echo "Building and starting container..."
    docker-compose up -d --build
    
    # Wait for container to start
    sleep 5
    
    # Check container status
    if docker ps | grep -q birbola-frontend; then
        echo "✓ Container started successfully"
        docker ps | grep birbola-frontend
    else
        echo "✗ Container failed to start"
        docker-compose logs --tail=50
        exit 1
    fi
    
    # Clean up
    rm /tmp/${PACKAGE_NAME}
    
    # Clean up old backups (keep last 3)
    cd ${SERVER_PATH}
    ls -t dist.backup.* 2>/dev/null | tail -n +4 | xargs -r sudo rm -rf
    
    echo "Deployment completed!"
EOF

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}=== Deployment Successful! ===${NC}"
    echo -e "${GREEN}Your application is now running at: https://birbola.uz${NC}\n"
    
    # Clean up local package
    rm "$PACKAGE_NAME"
else
    echo -e "\n${RED}=== Deployment Failed! ===${NC}"
    echo -e "${RED}Please check the error messages above${NC}\n"
    exit 1
fi
