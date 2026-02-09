# Cloudflare Integration Guide for Birbola

## Overview
This guide covers integrating Cloudflare with your Birbola website for improved performance, security, and reliability.

## Prerequisites
- Domain: `birbola.uz` (already configured)
- Server with nginx running
- Cloudflare account (free tier works)

## Setup Steps

### 1. Add Domain to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Add a Site"
3. Enter `birbola.uz`
4. Select a plan (Free plan is sufficient to start)
5. Cloudflare will scan your DNS records

### 2. Update DNS Records

Ensure these DNS records are present:

```
Type    Name    Content             Proxy Status
A       @       YOUR_SERVER_IP      Proxied (Orange Cloud)
A       www     YOUR_SERVER_IP      Proxied (Orange Cloud)
```

**Important:** Enable "Proxied" (orange cloud icon) to route traffic through Cloudflare.

### 3. Update Nameservers

At your domain registrar, update nameservers to Cloudflare's:
- Cloudflare will provide 2 nameservers (e.g., `ns1.cloudflare.com`, `ns2.cloudflare.com`)
- Replace your current nameservers with these
- DNS propagation takes 24-48 hours (usually faster)

### 4. Configure SSL/TLS

**Recommended Settings:**

1. **SSL/TLS Encryption Mode:** Full (Strict)
   - Path: `SSL/TLS` → `Overview`
   - Select "Full (strict)" mode
   - This ensures end-to-end encryption

2. **Always Use HTTPS:** ON
   - Path: `SSL/TLS` → `Edge Certificates`
   - Enable "Always Use HTTPS"

3. **Automatic HTTPS Rewrites:** ON
   - Automatically rewrites HTTP URLs to HTTPS

4. **Minimum TLS Version:** TLS 1.2
   - Path: `SSL/TLS` → `Edge Certificates`

### 5. Configure Caching

**Page Rules (Free plan: 3 rules)**

1. **Cache Everything for Static Assets:**
   ```
   URL: birbola.uz/*.{jpg,jpeg,png,gif,ico,css,js,svg,woff,woff2,ttf,eot}
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   ```

2. **Bypass Cache for API:**
   ```
   URL: api.birbola.uz/*
   Settings:
   - Cache Level: Bypass
   ```

3. **Cache HTML (Optional):**
   ```
   URL: birbola.uz/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 2 hours
   - Browser Cache TTL: 4 hours
   ```

**Caching Configuration:**
- Path: `Caching` → `Configuration`
- Browser Cache TTL: 4 hours
- Crawler Hints: ON

### 6. Security Settings

**Firewall Rules:**

1. **Block Bad Bots:**
   ```
   Field: Known Bots
   Operator: equals
   Value: Off
   Action: Block
   ```

2. **Rate Limiting (Pro plan+):**
   - Limit requests per IP to prevent DDoS

**Security Level:**
- Path: `Security` → `Settings`
- Security Level: Medium (adjust based on traffic)

**Bot Fight Mode:**
- Path: `Security` → `Bots`
- Enable "Bot Fight Mode" (Free plan)

### 7. Performance Optimization

**Auto Minify:**
- Path: `Speed` → `Optimization`
- Enable: JavaScript, CSS, HTML

**Brotli Compression:**
- Path: `Speed` → `Optimization`
- Enable Brotli (better than gzip)

**Rocket Loader:**
- Path: `Speed` → `Optimization`
- Enable for faster JavaScript loading

**Early Hints:**
- Path: `Speed` → `Optimization`
- Enable for faster page loads

### 8. Configure API Subdomain

If using `auth.birbola.uz` for authentication:

**DNS Record:**
```
Type    Name    Content             Proxy Status
A       auth    YOUR_AUTH_SERVER    Proxied
```

**Page Rule:**
```
URL: auth.birbola.uz/*
Settings:
- Cache Level: Bypass
- Disable Apps
- Disable Performance
```

### 9. Nginx Configuration

The nginx config has been updated with Cloudflare IP ranges to restore real visitor IPs.

**Verify Real IP is Working:**
```bash
# Check nginx logs show real IPs, not Cloudflare IPs
tail -f /var/log/nginx/access.log
```

### 10. Testing

**After Setup:**

1. **Check DNS Propagation:**
   ```bash
   dig birbola.uz
   nslookup birbola.uz
   ```

2. **Verify Cloudflare is Active:**
   - Visit your site
   - Check response headers for `cf-ray` and `cf-cache-status`
   ```bash
   curl -I https://birbola.uz
   ```

3. **Test SSL:**
   - Visit [SSL Labs](https://www.ssllabs.com/ssltest/)
   - Should get A+ rating

4. **Check Performance:**
   - Use [GTmetrix](https://gtmetrix.com)
   - Use [PageSpeed Insights](https://pagespeed.web.dev)

## Cloudflare Features to Enable

### Free Plan Features:
- ✅ CDN (Global edge network)
- ✅ DDoS protection (Unmetered)
- ✅ SSL/TLS certificates (Universal SSL)
- ✅ Web Application Firewall (WAF)
- ✅ Bot protection
- ✅ Analytics
- ✅ Page Rules (3 rules)

### Pro Plan Features ($20/month):
- Image optimization
- Mobile optimization
- 20 Page Rules
- WAF custom rules
- Prioritized email support

### Business Plan Features ($200/month):
- Advanced DDoS protection
- 50 Page Rules
- Custom SSL certificates
- PCI compliance
- 24/7 phone support

## Monitoring

**Cloudflare Analytics:**
- Path: `Analytics & Logs` → `Traffic`
- Monitor: Requests, bandwidth, threats blocked

**Set Up Alerts:**
- Path: `Notifications`
- Configure alerts for:
  - DDoS attacks
  - SSL certificate expiration
  - High error rates

## Troubleshooting

### Issue: Too Many Redirects
**Solution:** Change SSL/TLS mode to "Full (strict)"

### Issue: 502 Bad Gateway
**Solution:** 
- Check origin server is running
- Verify SSL certificates on origin
- Temporarily pause Cloudflare to test origin

### Issue: Slow Performance
**Solution:**
- Enable Auto Minify
- Enable Brotli
- Check cache hit ratio in analytics
- Adjust Page Rules

### Issue: API Requests Failing
**Solution:**
- Ensure API subdomain has "Bypass Cache" rule
- Check CORS headers are preserved
- Verify SSL/TLS settings

## Best Practices

1. **Always use "Full (strict)" SSL mode** for maximum security
2. **Enable "Always Use HTTPS"** to force HTTPS
3. **Use Page Rules wisely** (only 3 on free plan)
4. **Monitor analytics regularly** to optimize caching
5. **Keep origin server secure** - Cloudflare adds a layer, but origin must be secure
6. **Use Cloudflare Workers** for edge computing (advanced)
7. **Enable Bot Fight Mode** to reduce bot traffic
8. **Set up email notifications** for critical events

## Additional Resources

- [Cloudflare Docs](https://developers.cloudflare.com)
- [Cloudflare Community](https://community.cloudflare.com)
- [Cloudflare Status](https://www.cloudflarestatus.com)

## Support

If you encounter issues:
1. Check Cloudflare Status page
2. Review Cloudflare Analytics for errors
3. Temporarily pause Cloudflare to isolate issues
4. Contact Cloudflare support (email for free plan)
