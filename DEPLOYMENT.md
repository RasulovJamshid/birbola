# Deployment Guide for birbola.uz

## Prerequisites

- Docker and Docker Compose installed on the server
- Domain `birbola.uz` pointing to your server's IP address
- SSH access to the server
- Ports 80 and 443 available (not used by other services)

## Architecture

This setup runs Nginx **inside Docker** (not as a system service), making it consistent with other Docker containers on your server.

```
Internet (Port 80/443) → Docker Container (Nginx + React App)
```

## Deployment Steps

### 1. Prepare the Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose (if not already installed)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Ensure ports 80 and 443 are not in use
sudo netstat -tulpn | grep -E ':80|:443'

# If system Nginx is running and not needed, stop it
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### 2. Upload Project Files

```bash
# On your local machine, create a tarball (excluding node_modules)
tar -czf birbola-frontend.tar.gz --exclude=node_modules --exclude=.git .

# Upload to server
scp birbola-frontend.tar.gz user@your-server:/home/user/

# On the server, extract files
ssh user@your-server
mkdir -p /opt/birbola-frontend
cd /opt/birbola-frontend
tar -xzf ~/birbola-frontend.tar.gz
```

### 3. Setup SSL Certificate (Before Starting Container)

**⚠️ If you already have SSL certificates on your server (e.g., for API services), skip to "Using Existing SSL Certificates" below.**

#### Option A: Automated SSL Setup (New Certificates)

```bash
# Navigate to project directory
cd /opt/birbola-frontend

# Make SSL setup script executable
chmod +x setup-ssl.sh

# Run SSL setup (this will obtain certificates and start the container)
sudo ./setup-ssl.sh

# The script will:
# 1. Install certbot
# 2. Obtain SSL certificates for birbola.uz and www.birbola.uz
# 3. Copy certificates to ./ssl/ directory
# 4. Start the Docker container with SSL enabled
# 5. Setup auto-renewal
```

#### Option B: Using Existing SSL Certificates

If you already have SSL certificates (e.g., for your API):

```bash
cd /opt/birbola-frontend

# Create ssl directory
mkdir -p ./ssl

# Copy your existing certificates
sudo cp /etc/letsencrypt/live/birbola.uz/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/birbola.uz/privkey.pem ./ssl/

# Set proper permissions
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem
sudo chown $USER:$USER ./ssl/*.pem

# Start the container
docker-compose up -d --build
```

**See [USE-EXISTING-SSL.md](./USE-EXISTING-SSL.md) for more options and certificate renewal setup.**

#### Option C: Manual SSL Setup

```bash
# Stop any service using port 80
sudo netstat -tulpn | grep :80

# Obtain certificate using certbot standalone
sudo certbot certonly --standalone \
    -d birbola.uz \
    -d www.birbola.uz \
    --email admin@birbola.uz \
    --agree-tos

# Create ssl directory and copy certificates
mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/birbola.uz/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/birbola.uz/privkey.pem ./ssl/
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem

# Start the container
docker-compose up -d --build
```

### 4. Verify Deployment

```bash
# Check if container is running
docker ps | grep birbola-frontend

# View logs
docker-compose logs -f

# Test HTTP (should redirect to HTTPS)
curl -I http://birbola.uz

# Test HTTPS
curl -I https://birbola.uz

# Check SSL certificate
echo | openssl s_client -servername birbola.uz -connect birbola.uz:443 2>/dev/null | openssl x509 -noout -dates
```

## Updating the Application

```bash
# Pull latest changes or upload new files
cd /opt/birbola-frontend

# Rebuild and restart container
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

## Useful Commands

```bash
# View container logs
docker-compose logs -f birbola-frontend

# Restart container
docker-compose restart

# Stop container
docker-compose down

# Remove container and images
docker-compose down --rmi all

# Execute commands inside container
docker exec -it birbola-frontend sh

# View Nginx logs inside container
docker exec birbola-frontend cat /var/log/nginx/access.log
docker exec birbola-frontend cat /var/log/nginx/error.log

# Test Nginx config inside container
docker exec birbola-frontend nginx -t

# Reload Nginx inside container (without restarting)
docker exec birbola-frontend nginx -s reload
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Check if ports 80/443 are already in use
sudo netstat -tulpn | grep -E ':80|:443'

# Check what's using the ports
sudo lsof -i :80
sudo lsof -i :443

# If another container is using the ports, stop it first
docker ps
docker stop <container-name>
```

### Nginx errors inside container
```bash
# Check Nginx configuration
docker exec birbola-frontend nginx -t

# View error logs
docker-compose logs birbola-frontend

# Access container shell
docker exec -it birbola-frontend sh
```

### SSL certificate issues
```bash
# Check if certificates exist
ls -la ./ssl/

# Verify certificate validity
openssl x509 -in ./ssl/fullchain.pem -noout -dates

# Renew certificates manually
sudo certbot renew

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/birbola.uz/*.pem ./ssl/

# Restart container to load new certificates
docker-compose restart
```

### Port conflicts with other Docker containers
```bash
# List all containers using ports 80/443
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E '80|443'

# If you need to use different ports, modify docker-compose.yml:
# ports:
#   - "8080:80"
#   - "8443:443"
```

## Network Configuration

The Docker container directly exposes ports 80 and 443 to the host. Nginx runs inside the container and serves the React app.

```
Internet → Docker Container (Nginx on 80/443) → React App
```

## Security Considerations

- The container runs with `restart: unless-stopped` policy
- Nginx handles SSL/TLS termination
- Security headers are configured in both nginx configs
- Static assets are cached for 1 year
- Gzip compression is enabled

## Monitoring

```bash
# Check container health
docker ps
docker stats birbola-frontend

# Check disk usage
docker system df

# Clean up unused images
docker system prune -a
```
