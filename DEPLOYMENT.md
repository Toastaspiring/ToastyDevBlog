# Deployment Guide for ToastyDevBlog

This guide details how to deploy the **Backend** to Supabase Edge Functions and the **Frontend** to GitHub Pages.

## Prerequisites
- **Supabase Account** & Project.
- **GitHub Repository**.
- **Supabase CLI** installed locally.
- **Git** configured.

---

## Part 1: Backend Deployment (Supabase Edge Functions)

Your backend logic resides in `supabase/functions/api`.

### 1. Login & Link
```bash
npx supabase login
npx supabase link --project-ref <your-project-id>
```

### 2. Set Secrets
```bash
npx supabase secrets set DATABASE_URL="postgresql://..." JWT_SECRET="your-jwt-secret"
```

### 3. Deploy
```bash
npx supabase functions deploy api --no-verify-jwt
```
**URL**: `https://<project-ref>.supabase.co/functions/v1/api`

---

## Part 2: Frontend Deployment (GitHub Pages)

### Option A: Automated (GitHub Actions)
Push code to `main`. The workflow in `.github/workflows/deploy.yml` will automatically build and deploy to the `gh-pages` branch.
*Requires `VITE_API_URL` secret in GitHub Settings.*

### Option B: Manual (Build Branch)
If you prefer to build locally and push the result:

1.  **Build Locally**:
    (Powershell)
    ```powershell
    $env:VITE_API_URL="https://bgzmgorffzjigizqztbx.supabase.co/functions/v1/api"; pnpm vite build
    ```

2.  **Deploy to Branch**:
    (Powershell)
    ```powershell
    cd dist
    git init
    git add .
    git commit -m "Manual Deploy"
    git push -f https://github.com/Toastaspiring/ToastyDevBlog.git HEAD:build
    ```

3.  **Configure GitHub Pages**:
    - Go to Repo **Settings > Pages**.
    - **Source**: Deploy from a branch.
    - **Branch**: Select `build` / `/root`.
    - Click **Save**.
