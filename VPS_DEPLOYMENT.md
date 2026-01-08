# VPS Deployment Guide for ToastyDevBlog

This guide covers deploying both the **Frontend** and **Backend** to your VPS server.

## Prerequisites

- VPS with Ubuntu/Debian (or similar)
- SSH access to your VPS
- Domain name (optional but recommended)
- Node.js 18+ and pnpm installed on VPS
- Nginx installed on VPS
- PM2 for process management

---

## Part 1: Initial VPS Setup

### 1. Connect to Your VPS
```bash
ssh user@your-vps-ip
```

### 2. Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

---

## Part 2: Deploy Your Application

### 1. Clone Repository
```bash
# Navigate to web directory
cd /var/www

# Clone your repo
sudo git clone https://github.com/Toastaspiring/ToastyDevBlog.git
cd ToastyDevBlog

# Set proper permissions
sudo chown -R $USER:$USER /var/www/ToastyDevBlog
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
```bash
# Create .env file
nano .env
```

Add your environment variables:
```env
VITE_API_URL=http://localhost:3344/_api
VITE_SUPABASE_URL=https://bgzmgorffzjigizqztbx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Also create `env.json` for the backend:
```bash
nano env.json
```

```json
{
  "SUPABASE_URL": "https://bgzmgorffzjigizqztbx.supabase.co",
  "SUPABASE_ANON_KEY": "your-anon-key-here",
  "JWT_SECRET": "your-jwt-secret"
}
```

### 4. Build Frontend
```bash
pnpm build
```

### 5. Start Backend with PM2
```bash
# Start the backend server
pm2 start server.ts --name toasty-backend --interpreter pnpm -- tsx

# Start the frontend dev server (or use nginx to serve dist/)
pm2 start "pnpm vite preview --port 5173 --host" --name toasty-frontend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

---

## Part 3: Configure Nginx

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/toastydevblog
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain or VPS IP

    # Frontend
    location / {
        root /var/www/ToastyDevBlog/dist;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }

    # Backend API
    location /_api {
        proxy_pass http://localhost:3344;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        root /var/www/ToastyDevBlog/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/toastydevblog /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Part 4: SSL Certificate (Optional but Recommended)

### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
```

---

## Part 5: Deployment Workflow

### For Future Updates

1. **On Your Local Machine:**
```bash
# Commit and push changes
git add .
git commit -m "Your changes"
git push origin main
```

2. **On Your VPS:**
```bash
# Navigate to project
cd /var/www/ToastyDevBlog

# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install

# Rebuild frontend
pnpm build

# Restart backend (if server.ts changed)
pm2 restart toasty-backend

# Restart frontend preview (if needed)
pm2 restart toasty-frontend
```

### Automated Deployment Script

Create a deployment script:
```bash
nano deploy.sh
```

```bash
#!/bin/bash
cd /var/www/ToastyDevBlog
git pull origin main
pnpm install
pnpm build
pm2 restart toasty-backend
pm2 restart toasty-frontend
echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Now you can deploy with:
```bash
./deploy.sh
```

---

## Part 6: Monitoring & Maintenance

### View Logs
```bash
# View backend logs
pm2 logs toasty-backend

# View frontend logs
pm2 logs toasty-frontend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Status
```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx
```

### Restart Services
```bash
# Restart backend
pm2 restart toasty-backend

# Restart Nginx
sudo systemctl restart nginx
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3344
sudo lsof -i :3344

# Kill process
sudo kill -9 <PID>
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/ToastyDevBlog
```

### Nginx 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs toasty-backend`
- Verify port 3344 is accessible: `curl http://localhost:3344/_api/posts`

---

## Notes

- **Environment Variables**: Make sure `.env` and `env.json` are NOT committed to Git (they should be in `.gitignore`)
- **Security**: Always use HTTPS in production with SSL certificates
- **Firewall**: Ensure ports 80 and 443 are open in your VPS firewall
- **Database**: Your Supabase database remains hosted on Supabase - only the frontend and API server run on your VPS
