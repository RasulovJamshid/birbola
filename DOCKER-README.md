# Docker Setup for Birbola.uz Frontend

## Overview

This project uses Docker to containerize the React frontend application with Nginx running **inside the container**. This approach is consistent with other Docker-based services and doesn't require a system-level Nginx installation.

## Files Created

- **Dockerfile** - Multi-stage build for optimized production image
- **docker-compose.yml** - Docker Compose configuration (exposes ports 80/443)
- **nginx.conf** - Nginx configuration inside the container (handles SSL and routing)
- **setup-ssl.sh** - Automated SSL certificate setup script
- **.dockerignore** - Files to exclude from Docker build
- **deploy.sh** - Local deployment script
- **deploy-to-server.sh** - Remote deployment script
- **DEPLOYMENT.md** - Detailed deployment guide
- **DOCKER-README.md** - This file

**Note:** `birbola.uz.conf` is no longer needed as Nginx runs inside Docker.

## Quick Start

### Local Development with Docker

```bash
# Build and run (HTTP only for development)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at: http://localhost (port 80)

### Production Deployment

#### Option 1: Automated Deployment with SSL

1. Upload files to server:
   ```bash
   scp -r . user@server:/opt/birbola-frontend/
   ```

2. SSH into server:
   ```bash
   ssh user@server
   cd /opt/birbola-frontend
   ```

3. Run automated SSL setup:
   ```bash
   chmod +x setup-ssl.sh
   sudo ./setup-ssl.sh
   ```

This script will:
- Obtain SSL certificates from Let's Encrypt
- Copy certificates to `./ssl/` directory
- Start the Docker container with HTTPS enabled
- Setup automatic certificate renewal

#### Option 2: Deploy from Local Machine

1. Update `deploy-to-server.sh` with your server details:
   ```bash
   SERVER_USER="your-username"
   SERVER_HOST="your-server-ip"
   ```

2. Make script executable and run:
   ```bash
   chmod +x deploy-to-server.sh
   ./deploy-to-server.sh
   ```

3. Then setup SSL on the server:
   ```bash
   ssh user@server
   cd /opt/birbola-frontend
   sudo ./setup-ssl.sh
   ```

## Architecture

```
┌─────────────────────────────────┐
│          Internet               │
│      (birbola.uz)               │
└────────────┬────────────────────┘
             │
             │ Port 80/443
             ▼
┌─────────────────────────────────┐
│    Docker Container             │
│    birbola-frontend             │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Nginx (Port 80/443)      │  │
│  │  - SSL Termination        │  │
│  │  - HTTP → HTTPS Redirect  │  │
│  │  - Serves Static Files    │  │
│  └──────────┬────────────────┘  │
│             │                   │
│             ▼                   │
│  ┌───────────────────────────┐  │
│  │  React App                │  │
│  │  (Static Build)           │  │
│  └───────────────────────────┘  │
│                                 │
│  Volumes:                       │
│  - ./ssl → /etc/nginx/ssl       │
│  - ./nginx.conf → /etc/nginx/   │
└─────────────────────────────────┘
```

## Port Configuration

- **Container Ports**: 80 (HTTP) and 443 (HTTPS)
- **Host Ports**: 80 and 443 (directly mapped)
- **No proxy needed**: Container directly handles all traffic

**If ports 80/443 are in use**, modify `docker-compose.yml`:
```yaml
ports:
  - "8080:80"   # HTTP on port 8080
  - "8443:443"  # HTTPS on port 8443
```

Then access via: `http://birbola.uz:8080` or `https://birbola.uz:8443`

## Environment Variables

Create `.env` file if needed:
```env
NODE_ENV=production
VITE_API_URL=https://api.birbola.uz/api/v1
```

Update `docker-compose.yml` to use it:
```yaml
env_file:
  - .env
```

## Nginx Configuration Details

### Container Nginx (nginx.conf)
- Serves static files from `/usr/share/nginx/html`
- Handles React Router with `try_files`
- Enables Gzip compression
- Caches static assets for 1 year

### Server Nginx (birbola.uz.conf)
- SSL/TLS termination
- HTTP to HTTPS redirect
- Proxy to Docker container
- Security headers
- Request logging

## Coexisting with Other Docker Containers

The setup uses:
- **Custom network**: `birbola-network` (isolated from other containers)
- **Unique container name**: `birbola-frontend`
- **Specific port**: 3000 (can be changed if conflicts exist)

To connect with other containers (e.g., API backend):
```yaml
networks:
  birbola-network:
    external: true  # If network already exists
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep 3000

# Change port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Check if image built correctly
docker images | grep birbola

# Rebuild without cache
docker-compose build --no-cache
```

### Nginx 502 Bad Gateway
```bash
# Check if container is running
docker ps | grep birbola-frontend

# Check container logs
docker-compose logs

# Verify port mapping
docker port birbola-frontend
```

### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --dry-run
```

## Maintenance

### View Logs
```bash
# Container logs
docker-compose logs -f

# Nginx access logs
sudo tail -f /var/log/nginx/birbola.uz.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/birbola.uz.error.log
```

### Update Application
```bash
# Pull changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Clean Up
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Security Best Practices

1. **SSL/TLS**: Always use HTTPS in production
2. **Firewall**: Only expose necessary ports (80, 443)
3. **Updates**: Keep Docker and Nginx updated
4. **Secrets**: Never commit `.env` files with sensitive data
5. **Backups**: Regular backups of configuration and data

## Performance Optimization

1. **Gzip Compression**: Enabled in both Nginx configs
2. **Static Asset Caching**: 1-year cache for immutable assets
3. **Multi-stage Build**: Smaller image size (~25MB)
4. **Production Build**: Optimized React build with Vite

## Monitoring

```bash
# Container resource usage
docker stats birbola-frontend

# Container health
docker inspect birbola-frontend | grep -A 10 State

# Disk usage
docker system df
```

## Support

For issues or questions:
1. Check logs first
2. Review DEPLOYMENT.md for detailed steps
3. Verify all configuration files are correct
4. Ensure DNS is properly configured for birbola.uz
