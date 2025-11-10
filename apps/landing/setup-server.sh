#!/bin/bash

# Server Setup Script for norchain.org
# Run this on the target server (44.200.71.179)

set -e

echo "🔧 Setting up server for norchain.org deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y nginx curl wget git unzip

# Create web directory
echo "📁 Creating web directories..."
sudo mkdir -p /var/www/norchain.org
sudo mkdir -p /var/backups/norchain.org
sudo mkdir -p /var/log/nginx

# Set permissions
sudo chown -R $USER:$USER /var/www/norchain.org
sudo chown -R www-data:www-data /var/www/norchain.org

# Install nginx configuration
echo "⚙️ Configuring nginx..."
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/norchain.org

# Enable site
sudo ln -sf /etc/nginx/sites-available/norchain.org /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start and enable nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Create a simple index page for testing
echo "📝 Creating test page..."
cat << 'HTML' > /var/www/norchain.org/index.html
<!DOCTYPE html>
<html>
<head>
    <title>NorChain Infrastructure</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #1e3a8a, #7c3aed); color: white; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 NorChain Infrastructure</h1>
        <p>Server setup complete! Waiting for deployment...</p>
        <p>This page will be replaced with the full NorChain landing page shortly.</p>
    </div>
</body>
</html>
HTML

sudo chown www-data:www-data /var/www/norchain.org/index.html

echo "✅ Server setup complete!"
echo "🌐 Test: http://norchain.org"
echo "📋 Next steps:"
echo "   1. Point norchain.org domain to this server (44.200.71.179)"
echo "   2. Run deployment script from local machine"
echo "   3. Configure SSL with Let's Encrypt (optional)"