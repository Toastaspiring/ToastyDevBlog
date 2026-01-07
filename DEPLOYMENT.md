# Deployment Guide for ToastyDevBlog

This guide details how to deploy the **Backend** to Supabase Edge Functions and the **Frontend** to GitHub Pages with auto-deployment via GitHub Actions.

## Prerequisites
- **Supabase Account** & Project.
- **GitHub Repository**.
- **Supabase CLI** installed locally (`npm i -g supabase` or `brew install supabase`).
- **Git** configured.

---

## Part 1: Backend Deployment (Supabase Edge Functions)

Your backend logic resides in `supabase/functions/api`.

### 1. Login to Supabase CLI
```bash
npx supabase login
```
Follow the browser instructions to authenticate.

### 2. Link Local Project to Remote
Run this command in your project root:
```bash
npx supabase link --project-ref <your-project-id>
```
*Tip: Get your Project ID from the Supabase Dashboard URL (e.g., `https://supabase.com/dashboard/project/abcxyz`).*

### 3. Set Environment Variables (Secrets)
Your Edge Functions need access to the database and JWT secret. Set them in Supabase:

```bash
npx supabase secrets set DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" 
npx supabase secrets set JWT_SECRET="your-jwt-secret"
```
*Note: Use the "Transaction Pooler" connection string (port 6543) for best performance with Serverless functions.*
*Also set any other secrets present in your `env.json` (e.g., `GOOGLE_CLIENT_ID` if used).*

### 4. Deploy the Function
Deploy the `api` function. We use `--no-verify-jwt` because our code handles specific routes and we might want public access to some endpoints (or we handle auth manually via our custom session logic).

```bash
npx supabase functions deploy api --no-verify-jwt
```

**Success!** The CLI will output your Function URL:
`https://<project-ref>.supabase.co/functions/v1/api`

**Copy this URL.** You will need it for the Frontend configuration.

---

## Part 2: Frontend Deployment (GitHub Pages)

We will use GitHub Actions to automatically build and deploy your React app to GitHub Pages whenever you push to the `main` branch.

### 1. Configure GitHub Repository
1.  Go to your Repository on GitHub.
2.  Navigate to **Settings** > **Pages**.
3.  Under **"Build and deployment"**, select **Source**: `GitHub Actions`.
    *   *If you don't see "GitHub Actions", just leave it for now. The workflow file we create below will configure it.*

### 2. Set API URL in GitHub Secrets (Optional but Recommended)
Ideally, we inject the Backend URL during the build.
1.  Go to **Settings** > **Secrets and variables** > **Actions**.
2.  Click **New repository secret**.
3.  Name: `VITE_API_URL`
4.  Value: `https://<project-ref>.supabase.co/functions/v1/api` (The URL from Part 1).

### 3. Create Deployment Workflow
Create a file at `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm vite build
        env:
          # If you set the secret in Step 2:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          # Fallback if hardcoded:
          # VITE_API_URL: "https://<project-ref>.supabase.co/functions/v1/api"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4. Commit and Push
```bash
git add .
git commit -m "Configure deployment"
git push origin main
```

GitHub Actions will start building. Once finished, your site will be live at `https://<username>.github.io/ToastyDevBlog/`.

---

## Summary of Workflow
1.  **Code Changes**: Work locally.
2.  **Backend Update**: If you change backend code (`supabase/functions`), run `npx supabase functions deploy api --no-verify-jwt`.
3.  **Frontend Update**: If you change frontend code (`src/*`, `pages/*`), just `git push`. GitHub Actions handles the rest.
