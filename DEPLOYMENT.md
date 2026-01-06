# Deployment Guide for ToastyDevBlog

Since this is a full-stack application (Node.js backend + React frontend + PostgreSQL database), you cannot use static hosting like GitHub Pages alone. You need a server to run the backend logic.

## Prerequisites
-   **Database**: You are already using **Supabase** (as seen in your `env.json`), so your database is hosted and accessible from anywhere. You don't need to migrate it.
-   **Code**: Your code is ready (built with Vite, served by `server.ts`).

---

## Option 1: PaaS (Recommended: Render / Railway)
Platforms like Render or Railway can automatically build and run your app whenever you push to GitHub. This is the simplest "Push to Deploy" method.

### Steps for Render.com:
1.  Create a **Web Service** on Render.
2.  Connect your GitHub repository.
3.  **Build Command**: `pnpm install --frozen-lockfile; pnpm run build`
4.  **Start Command**: `pnpm run start`
5.  **Environment Variables**: Add the keys from your `env.json` (`DATABASE_URL`, `JWT_SECRET`, etc.) into the Render dashboard.
6.  **Done**: Render will detect pushes to `main` and re-deploy automatically.

---

## Option 2: VPS + GitHub Actions ("Push to Domain")
If you want to host it on your own server (e.g., a $5/mo VPS from DigitalOcean, Hetzner, or OVH) and have a standard domain (e.g., `myblog.com`), you can set up a GitHub Action to push code to it.

### 1. Prepare Server (VPS)
-   **Rent a VPS** (Ubuntu recommended).
-   **Install Node.js & PNPM**:
    ```bash
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    ```
-   **Install PM2** (process manager to keep app alive):
    ```bash
    npm install -g pm2
    ```
-   **Clone Repo**: `git clone <your-repo-url> /var/www/myblog`

### 2. Configure GitHub Action
Create `.github/workflows/deploy.yml` in your project:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}       # Your server IP
          username: ${{ secrets.VPS_USER }}   # usually 'root'
          key: ${{ secrets.SSH_PRIVATE_KEY }} # Private SSH key
          script: |
            cd /var/www/myblog
            git pull origin main
            pnpm install
            pnpm vite build
            pm2 restart all || pm2 start "pnpm tsx server.ts" --name "blog"
```

### 3. Add Secrets to GitHub
Go to Repo Settings -> Secrets and add `VPS_HOST`, `VPS_USER`, and `SSH_PRIVATE_KEY`.

### 4. Result
When you push to `main` on GitHub, this action will log into your server, pull the latest code, rebuild, and restart the app.
