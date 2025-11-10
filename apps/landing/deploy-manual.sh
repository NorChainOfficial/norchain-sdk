#!/bin/bash

# Manual Deployment Script for norchain.org
# Run this script ON THE SERVER (44.200.71.179) after uploading files

set -e

echo "🚀 Starting manual deployment for norchain.org..."

# Step 1: Update system and install dependencies
echo "📦 Installing dependencies..."
sudo apt update
sudo apt install -y nginx curl wget git unzip certbot python3-certbot-nginx

# Step 2: Create directories
echo "📁 Setting up directories..."
sudo mkdir -p /var/www/norchain.org
sudo mkdir -p /var/backups/norchain.org
sudo mkdir -p /var/log/nginx

# Step 3: Backup existing site if it exists
if [ -d "/var/www/norchain.org" ] && [ "$(ls -A /var/www/norchain.org)" ]; then
    echo "💾 Backing up existing site..."
    sudo cp -r /var/www/norchain.org /var/backups/norchain.org/backup-$(date +%Y%m%d_%H%M%S)
fi

# Step 4: Extract new files
echo "📤 Deploying new files..."
sudo rm -rf /var/www/norchain.org/*
cd /var/www/norchain.org
sudo tar -xzf /tmp/norchain-landing.tar.gz

# Step 5: Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/norchain.org
sudo chmod -R 755 /var/www/norchain.org

# Step 6: Configure nginx
echo "⚙️ Configuring nginx..."
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/norchain.org

# Remove default site and enable our site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/norchain.org /etc/nginx/sites-enabled/

# Step 7: Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# Step 8: Start nginx
echo "🔄 Starting nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# Step 9: Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Step 10: Configure SSL with Let's Encrypt
echo "🔒 Setting up SSL certificate..."
sudo certbot --nginx -d norchain.org -d www.norchain.org --non-interactive --agree-tos --email admin@norchain.org --redirect

# Step 11: Set up auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
sudo crontab -l | grep -v certbot | sudo crontab -
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

# Step 12: Clean up
echo "🧹 Cleaning up..."
rm -f /tmp/norchain-landing.tar.gz
rm -f /tmp/nginx.conf

# Step 13: Test deployment
echo "🧪 Testing deployment..."
sleep 2

# Test HTTP redirect to HTTPS
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://norchain.org)
echo "HTTP Status: $HTTP_STATUS"

# Test HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://norchain.org)
echo "HTTPS Status: $HTTPS_STATUS"

# Test health endpoint
HEALTH_STATUS=$(curl -s https://norchain.org/health)
echo "Health Check: $HEALTH_STATUS"

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your website is now live at:"
echo "   • https://norchain.org"
echo "   • https://www.norchain.org"
echo ""
echo "📊 SSL Certificate Info:"
sudo certbot certificates

echo ""
echo "🔧 Useful commands:"
echo "   • Check nginx status: sudo systemctl status nginx"
echo "   • Check SSL renewal: sudo certbot renew --dry-run"
echo "   • View nginx logs: sudo tail -f /var/log/nginx/norchain.org_access.log"
echo "   • View SSL logs: sudo journalctl -u certbot"