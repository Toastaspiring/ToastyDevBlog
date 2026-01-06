# Dark Code Blog Platform
        
create a simple dev blog where I have as creator the right to post blogposts, and visitors can log in with their github to then like and comment each blog post

the theme of the blog would be dark and simple, with slightly sharp look 

Made with Floot.

# Instructions

For security reasons, the `env.json` file is ignored. Create a file named `env.json` in the root directory with the following structure:

```json
{
  "FLOOT_OAUTH_CLIENT_ID": "your_floot_client_id_if_using_floot",
  "FLOOT_OAUTH_CLIENT_SECRET": "your_floot_client_secret_if_using_floot",
  "GITHUB_CLIENT_ID": "your_github_client_id",
  "GITHUB_CLIENT_SECRET": "your_github_client_secret",
  "DATABASE_URL": "postgresql://user:password@host:port/database",
  "JWT_SECRET": "your_generated_jwt_secret"
}
```

For **JWT secrets**, generate a value with:  
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For the **Database**, this project uses PostgreSQL. Ensure your database is running and schema is applied (see `schema.sql` if available).

**Note:** GitHub OAuth requires creating an OAuth App in your GitHub Developer Settings with the callback URL matching your deployment (e.g., `http://localhost:3344/api/auth/github/callback`).  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
