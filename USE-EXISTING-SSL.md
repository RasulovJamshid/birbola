# Using Existing SSL Certificates

If you already have SSL certificates on your server (e.g., for API services), you can reuse them instead of running `setup-ssl.sh`.

## Option 1: Copy Existing Certificates

```bash
# Navigate to project directory
cd /opt/birbola-frontend

# Create ssl directory
mkdir -p ./ssl

# Copy your existing certificates
# Replace the paths with your actual certificate locations
sudo cp /etc/letsencrypt/live/birbola.uz/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/birbola.uz/privkey.pem ./ssl/

# Or if your certificates are elsewhere:
# sudo cp /path/to/your/fullchain.pem ./ssl/
# sudo cp /path/to/your/privkey.pem ./ssl/

# Set proper permissions
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem
sudo chown $USER:$USER ./ssl/*.pem

# Start the container
docker-compose up -d --build
```

## Option 2: Mount Existing Certificate Directory

If you want to use certificates directly from their current location without copying:

**Edit `docker-compose.yml`:**

```yaml
services:
  birbola-frontend:
    # ... other settings ...
    volumes:
      # Mount your existing certificate directory (read-only)
      - /etc/letsencrypt/live/birbola.uz:/etc/nginx/ssl:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

Then start:
```bash
docker-compose up -d --build
```

## Option 3: Use Wildcard Certificate

If you have a wildcard certificate (e.g., `*.birbola.uz`):

```bash
cd /opt/birbola-frontend
mkdir -p ./ssl

# Copy wildcard certificate
sudo cp /path/to/wildcard/fullchain.pem ./ssl/
sudo cp /path/to/wildcard/privkey.pem ./ssl/

# Set permissions
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem

# Start container
docker-compose up -d --build
```

## Option 4: Shared Certificate with API

If your API and frontend share the same domain/subdomain:

```bash
cd /opt/birbola-frontend
mkdir -p ./ssl

# Link to the same certificates your API uses
sudo cp /etc/letsencrypt/live/birbola.uz/*.pem ./ssl/

# Or create symbolic links (if on same filesystem)
ln -s /etc/letsencrypt/live/birbola.uz/fullchain.pem ./ssl/fullchain.pem
ln -s /etc/letsencrypt/live/birbola.uz/privkey.pem ./ssl/privkey.pem

docker-compose up -d --build
```

## Verify Certificates

After copying certificates, verify they're valid:

```bash
# Check if files exist
ls -la ./ssl/

# Verify certificate details
openssl x509 -in ./ssl/fullchain.pem -noout -text

# Check expiry date
openssl x509 -in ./ssl/fullchain.pem -noout -dates

# Test the domain
openssl x509 -in ./ssl/fullchain.pem -noout -subject
```

## Certificate Renewal

Since you're using existing certificates, make sure your existing renewal process also updates the certificates in the Docker container.

### Add to your existing certbot renewal hook:

```bash
# Edit your certbot renewal configuration
sudo nano /etc/letsencrypt/renewal-hooks/deploy/update-docker.sh
```

Add:
```bash
#!/bin/bash
# Update certificates for birbola-frontend container
cp /etc/letsencrypt/live/birbola.uz/fullchain.pem /opt/birbola-frontend/ssl/
cp /etc/letsencrypt/live/birbola.uz/privkey.pem /opt/birbola-frontend/ssl/
cd /opt/birbola-frontend && docker-compose restart
```

Make it executable:
```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/update-docker.sh
```

## Quick Deployment (Skip SSL Setup)

```bash
# 1. Upload files
scp -r . user@server:/opt/birbola-frontend/

# 2. SSH to server
ssh user@server
cd /opt/birbola-frontend

# 3. Copy existing certificates
mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/birbola.uz/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/birbola.uz/privkey.pem ./ssl/
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem

# 4. Start container
docker-compose up -d --build

# 5. Verify
curl -I https://birbola.uz
```

## Troubleshooting

### Certificate path not found?
```bash
# Find your certificates
sudo find /etc -name "fullchain.pem" 2>/dev/null
sudo find /etc -name "privkey.pem" 2>/dev/null

# Common locations:
# /etc/letsencrypt/live/birbola.uz/
# /etc/ssl/certs/
# /etc/nginx/ssl/
```

### Permission denied?
```bash
# Use sudo to copy
sudo cp /path/to/cert ./ssl/
sudo chown $USER:$USER ./ssl/*.pem
```

### Container can't read certificates?
```bash
# Check permissions inside container
docker exec birbola-frontend ls -la /etc/nginx/ssl/

# If needed, adjust permissions
chmod 644 ./ssl/fullchain.pem
chmod 600 ./ssl/privkey.pem
```

## Summary

**You don't need to run `setup-ssl.sh` if you already have SSL certificates.**

Just:
1. Copy existing certificates to `./ssl/` directory
2. Start the container with `docker-compose up -d --build`
3. Done!

The container will use your existing certificates automatically.
