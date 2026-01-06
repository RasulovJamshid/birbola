# Quick Start Guide - Birbola.uz Docker Deployment

## TL;DR - Production Deployment

### If you DON'T have SSL certificates yet:

```bash
# 1. Upload to server
scp -r . user@your-server:/opt/birbola-frontend/

# 2. SSH to server
ssh user@your-server
cd /opt/birbola-frontend

# 3. Setup SSL and start
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh

# Done! Visit https://birbola.uz
```

### If you ALREADY have SSL certificates:

```bash
# 1. Upload to server
scp -r . user@your-server:/opt/birbola-frontend/

# 2. SSH to server and copy existing certificates
ssh user@your-server
cd /opt/birbola-frontend
mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/birbola.uz/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/birbola.uz/privkey.pem ./ssl/
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem

# 3. Start container
docker-compose up -d --build

# Done! Visit https://birbola.uz
```

**See [USE-EXISTING-SSL.md](./USE-EXISTING-SSL.md) for more options.**

## What's Different from Standard Nginx Setup?

✅ **Nginx runs INSIDE Docker** (not as system service)  
✅ **No external Nginx configuration needed**  
✅ **Ports 80/443 directly exposed from container**  
✅ **Consistent with other Docker containers**  

## Architecture

```
Internet → Docker Container (Nginx + React) → Your App
         Port 80/443
```

## Key Files

- `docker-compose.yml` - Exposes ports 80/443
- `nginx.conf` - Nginx config inside container (handles SSL)
- `setup-ssl.sh` - Automated SSL certificate setup
- `Dockerfile` - Multi-stage build (Node.js → Nginx)

## Common Commands

```bash
# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Check Nginx config inside container
docker exec birbola-frontend nginx -t

# Reload Nginx without restart
docker exec birbola-frontend nginx -s reload

# Access container shell
docker exec -it birbola-frontend sh
```

## SSL Certificate Management

```bash
# Initial setup (automatic)
sudo ./setup-ssl.sh

# Manual renewal
sudo certbot renew
sudo cp /etc/letsencrypt/live/birbola.uz/*.pem ./ssl/
docker-compose restart

# Check certificate expiry
openssl x509 -in ./ssl/fullchain.pem -noout -dates
```

## Troubleshooting

### Port 80/443 already in use?

```bash
# Check what's using the ports
sudo netstat -tulpn | grep -E ':80|:443'

# Stop conflicting service
docker stop <container-name>
# or
sudo systemctl stop nginx
```

### Container won't start?

```bash
# Check logs
docker-compose logs

# Verify SSL certificates exist
ls -la ./ssl/

# Test Nginx config
docker exec birbola-frontend nginx -t
```

### Need to update the app?

```bash
cd /opt/birbola-frontend
git pull  # or upload new files
docker-compose down
docker-compose up -d --build
```

## Coexisting with Other Docker Containers

This setup uses:
- **Custom network**: `birbola-network`
- **Unique container name**: `birbola-frontend`
- **Direct port mapping**: 80:80, 443:443

If you have other containers on ports 80/443, you can:

1. **Option A**: Stop the other container temporarily
2. **Option B**: Use different ports (modify `docker-compose.yml`)
   ```yaml
   ports:
     - "8080:80"
     - "8443:443"
   ```

## Directory Structure

```
/opt/birbola-frontend/
├── docker-compose.yml    # Container config
├── Dockerfile            # Build instructions
├── nginx.conf            # Nginx config (mounted into container)
├── setup-ssl.sh          # SSL automation script
├── ssl/                  # SSL certificates (created by setup-ssl.sh)
│   ├── fullchain.pem
│   └── privkey.pem
├── src/                  # React source code
└── dist/                 # Built React app (created during build)
```

## Security Checklist

- ✅ SSL/TLS enabled (HTTPS)
- ✅ HTTP → HTTPS redirect
- ✅ Security headers configured
- ✅ Auto-renewal for SSL certificates
- ✅ Firewall: Only ports 22, 80, 443 open
- ✅ Container restart policy: `unless-stopped`

## Need Help?

- **Detailed guide**: See `DEPLOYMENT.md`
- **Docker details**: See `DOCKER-README.md`
- **Check logs**: `docker-compose logs -f`
- **Test SSL**: `curl -I https://birbola.uz`
