#!/bin/bash

# Deployment script for birbola.uz frontend
# Usage: ./deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="birbola-frontend"
CONTAINER_NAME="birbola-frontend"
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo -e "${GREEN}Starting deployment for ${PROJECT_NAME}...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Stop existing container if running
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down || true

# Remove old images (optional, uncomment if needed)
# echo -e "${YELLOW}Removing old images...${NC}"
# docker rmi $(docker images -q ${PROJECT_NAME}) || true

# Build new image
echo -e "${YELLOW}Building Docker image...${NC}"
docker-compose build --no-cache

# Start container
echo -e "${YELLOW}Starting container...${NC}"
docker-compose up -d

# Wait for container to be healthy
echo -e "${YELLOW}Waiting for container to be ready...${NC}"
sleep 5

# Check if container is running
if docker ps | grep -q ${CONTAINER_NAME}; then
    echo -e "${GREEN}✓ Container is running successfully!${NC}"
    
    # Show container status
    echo -e "\n${GREEN}Container Status:${NC}"
    docker ps | grep ${CONTAINER_NAME}
    
    # Show logs
    echo -e "\n${GREEN}Recent logs:${NC}"
    docker-compose logs --tail=20
    
    echo -e "\n${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}Application is available at: http://localhost:3000${NC}"
else
    echo -e "${RED}✗ Container failed to start!${NC}"
    echo -e "${RED}Checking logs:${NC}"
    docker-compose logs
    exit 1
fi

# Clean up dangling images
echo -e "\n${YELLOW}Cleaning up dangling images...${NC}"
docker image prune -f

echo -e "\n${GREEN}All done!${NC}"
