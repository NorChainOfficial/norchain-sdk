# NorChain Landing Page Deployment Guide

Deploy the transformed NorChain infrastructure landing page to **norchain.org** (44.200.71.179).

## 🚀 Quick Deployment

### Prerequisites
- SSH access to server: `ubuntu@44.200.71.179`
- Domain `norchain.org` pointed to `44.200.71.179`

### 1. Server Setup (One-time)
```bash
# Upload nginx config and setup script to server
scp nginx.conf ubuntu@44.200.71.179:/tmp/
scp setup-server.sh ubuntu@44.200.71.179:/tmp/

# SSH into server and run setup
ssh ubuntu@44.200.71.179
chmod +x /tmp/setup-server.sh
sudo /tmp/setup-server.sh
```

### 2. Deploy Landing Page
```bash
# From your local machine, run the deployment script
./deploy.sh
```

## 📋 Manual Deployment Steps

### 1. Build Static Files
```bash
npm install
npm run build
```
This creates the `out/` directory with static files.

### 2. Create Deployment Package
```bash
tar -czf norchain-landing.tar.gz -C ./out .
```

### 3. Upload to Server
```bash
scp norchain-landing.tar.gz ubuntu@44.200.71.179:/tmp/
```

### 4. Deploy on Server
```bash
ssh ubuntu@44.200.71.179

# Backup existing files
sudo mkdir -p /var/backups/norchain.org
sudo cp -r /var/www/norchain.org /var/backups/norchain.org/backup-$(date +%Y%m%d_%H%M%S)

# Extract new files
cd /var/www/norchain.org
sudo rm -rf *
sudo tar -xzf /tmp/norchain-landing.tar.gz

# Set permissions
sudo chown -R www-data:www-data /var/www/norchain.org
sudo chmod -R 755 /var/www/norchain.org

# Clean up
rm /tmp/norchain-landing.tar.gz
```

## 🔧 Server Configuration

### Nginx Configuration
The `nginx.conf` file is configured for:
- HTTP/HTTPS serving
- Static file caching
- Gzip compression
- Security headers
- Health check endpoint

### Directory Structure
```
/var/www/norchain.org/          # Web root
/var/backups/norchain.org/      # Backups
/var/log/nginx/                 # Logs
```

## 🌐 Domain Configuration

Ensure `norchain.org` DNS points to:
```
A Record: norchain.org → 44.200.71.179
A Record: www.norchain.org → 44.200.71.179
```

## 🔒 SSL Configuration (Optional)

To enable HTTPS with Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d norchain.org -d www.norchain.org

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🧪 Testing

### Health Check
```bash
curl http://norchain.org/health
# Should return: healthy
```

### Performance Test
```bash
curl -w "@curl-format.txt" -o /dev/null -s http://norchain.org/
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## 📊 Features Deployed

✅ **Infrastructure-Focused Landing Page**
- Hero section with API performance metrics
- Developer ecosystem overview
- Enterprise features showcase
- Real-time infrastructure stats
- Professional design without emojis

✅ **Technical Components**
- DeveloperQuickStart with code examples
- EnterpriseFeatures with interactive cards
- Updated NetworkStats with API metrics
- Infrastructure-focused Features section

✅ **Performance Optimizations**
- Static site generation
- Optimized images and assets
- Compressed files (gzip)
- CDN-ready static files

## 🔄 Updates

To update the deployment:
1. Make changes locally
2. Run `./deploy.sh`
3. Verify at `http://norchain.org`

## 📞 Support

- **Website**: http://norchain.org
- **Documentation**: https://docs.norchain.org
- **API Docs**: https://api.norchain.org/api-docs

## 🏗 Architecture

The deployed site is:
- **Static**: Pure HTML/CSS/JS files
- **Fast**: Optimized for performance
- **Scalable**: Can handle high traffic
- **SEO-Ready**: Pre-rendered content
- **Professional**: Enterprise-grade presentation

Perfect for showcasing NorChain as a serious blockchain infrastructure provider! 🚀