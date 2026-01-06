#!/bin/bash

# SSL Certificate Setup Script for Docker
# This script helps obtain SSL certificates using certbot in standalone mode

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== SSL Certificate Setup for birbola.uz ===${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    apt update
    apt install -y certbot
fi

# Stop the container temporarily to free port 80
echo -e "${YELLOW}Stopping birbola-frontend container...${NC}"
docker-compose down || true

# Obtain certificate
echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
certbot certonly --standalone \
    -d birbola.uz \
    -d www.birbola.uz \
    --non-interactive \
    --agree-tos \
    --email admin@birbola.uz \
    --preferred-challenges http

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Certificate obtained successfully${NC}\n"
    
    # Create ssl directory
    mkdir -p ./ssl
    
    # Copy certificates to project directory
    echo -e "${YELLOW}Copying certificates...${NC}"
    cp /etc/letsencrypt/live/birbola.uz/fullchain.pem ./ssl/
    cp /etc/letsencrypt/live/birbola.uz/privkey.pem ./ssl/
    
    # Set permissions
    chmod 644 ./ssl/fullchain.pem
    chmod 600 ./ssl/privkey.pem
    
    echo -e "${GREEN}✓ Certificates copied to ./ssl/${NC}\n"
    
    # Start container
    echo -e "${YELLOW}Starting container with SSL...${NC}"
    docker-compose up -d
    
    echo -e "\n${GREEN}=== Setup Complete! ===${NC}"
    echo -e "${GREEN}Your site is now available at: https://birbola.uz${NC}\n"
    
    # Setup auto-renewal
    echo -e "${YELLOW}Setting up auto-renewal...${NC}"
    cat > /etc/cron.d/certbot-renew << 'EOF'
# Renew certificates and reload container
0 3 * * * root certbot renew --quiet --deploy-hook "cd /opt/birbola-frontend && cp /etc/letsencrypt/live/birbola.uz/*.pem ./ssl/ && docker-compose restart"
EOF
    
    echo -e "${GREEN}✓ Auto-renewal configured (runs daily at 3 AM)${NC}\n"
else
    echo -e "${RED}✗ Failed to obtain certificate${NC}"
    echo -e "${YELLOW}Starting container without SSL...${NC}"
    docker-compose up -d
    exit 1
fi
