# Birbola.uz - Deployment Documentation

## 📖 Documentation Index

Choose the guide that fits your needs:

### 🚀 **[QUICK-START.md](./QUICK-START.md)** ⭐ START HERE
**3 commands to deploy**  
Perfect for: Quick deployment, experienced users  
Time: 5 minutes

### 📘 **[DEPLOYMENT.md](./DEPLOYMENT.md)**
**Complete step-by-step guide**  
Perfect for: First-time deployment, detailed instructions  
Time: 15-20 minutes

### 🐳 **[DOCKER-README.md](./DOCKER-README.md)**
**Docker configuration details**  
Perfect for: Understanding the setup, customization  
Time: 10 minutes reading

### 📋 **[DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md)**
**What was configured and why**  
Perfect for: Overview, troubleshooting reference  
Time: 5 minutes reading

### 🔐 **[USE-EXISTING-SSL.md](./USE-EXISTING-SSL.md)**
**Using existing SSL certificates**  
Perfect for: Servers with existing SSL setup  
Time: 3 minutes

---

## 🎯 Quick Decision Guide

**I want to deploy NOW:**  
→ Use [QUICK-START.md](./QUICK-START.md)

**I already have SSL certificates:**  
→ See [USE-EXISTING-SSL.md](./USE-EXISTING-SSL.md)

**I'm new to Docker:**  
→ Read [DEPLOYMENT.md](./DEPLOYMENT.md)

**I need to customize the setup:**  
→ Check [DOCKER-README.md](./DOCKER-README.md)

**Something's not working:**  
→ See troubleshooting in [DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md)

---

## 🏗️ What's Different?

This setup runs **Nginx inside Docker** (not as a system service), making it consistent with your other Docker containers.

```
Before: Internet → System Nginx → Docker Container → App
Now:    Internet → Docker Container (Nginx + App)
```

### Benefits:
✅ No external Nginx configuration needed  
✅ Consistent with other Docker services  
✅ Easier to manage and update  
✅ Portable across servers  

---

## 📦 What You Get

- **Docker containerization** with multi-stage build
- **Nginx inside container** handling SSL and routing
- **Automated SSL setup** with Let's Encrypt
- **Production optimizations** (gzip, caching, security headers)
- **Deployment scripts** for automation
- **Auto-restart** on server reboot

---

## 🚀 Ultra-Quick Deployment

```bash
# 1. Upload
scp -r . user@server:/opt/birbola-frontend/

# 2. Deploy
ssh user@server "cd /opt/birbola-frontend && chmod +x setup-ssl.sh && sudo ./setup-ssl.sh"

# 3. Done!
# Visit https://birbola.uz
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Container configuration |
| `Dockerfile` | Build instructions |
| `nginx.conf` | Web server config (inside container) |
| `setup-ssl.sh` | Automated SSL setup |
| `deploy.sh` | Local deployment script |
| `deploy-to-server.sh` | Remote deployment script |

---

## 🔧 Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Update
docker-compose down && docker-compose up -d --build

# SSL Renewal
sudo certbot renew && sudo cp /etc/letsencrypt/live/birbola.uz/*.pem ./ssl/ && docker-compose restart
```

---

## 🆘 Quick Troubleshooting

**Port 80/443 in use?**
```bash
sudo netstat -tulpn | grep -E ':80|:443'
docker stop <conflicting-container>
```

**Container won't start?**
```bash
docker-compose logs
ls -la ./ssl/  # Check SSL certs exist
```

**Need to check SSL?**
```bash
curl -I https://birbola.uz
openssl x509 -in ./ssl/fullchain.pem -noout -dates
```

---

## 📞 Support

- **Detailed guides**: See documentation files listed above
- **Check logs**: `docker-compose logs -f`
- **Test deployment**: `curl -I https://birbola.uz`
- **Verify SSL**: `echo | openssl s_client -connect birbola.uz:443`

---

## ✅ Pre-Deployment Checklist

- [ ] Docker and Docker Compose installed on server
- [ ] Domain `birbola.uz` points to server IP
- [ ] Ports 80 and 443 are available
- [ ] SSH access to server configured
- [ ] Files uploaded to `/opt/birbola-frontend/`

---

## 🎓 Learning Path

1. **Start**: [QUICK-START.md](./QUICK-START.md) - Get it running
2. **Understand**: [DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md) - Learn what's happening
3. **Deep Dive**: [DOCKER-README.md](./DOCKER-README.md) - Master the configuration
4. **Reference**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed procedures

---

## 🚀 Ready to Deploy?

**Start here:** [QUICK-START.md](./QUICK-START.md)

Good luck! 🎉
