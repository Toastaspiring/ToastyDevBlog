import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle as handlePostsGet } from './endpoints/posts_GET.ts'
import { handle as handleSessionGet } from './endpoints/auth/session_GET.ts'
import { handle as handleLoginPost } from './endpoints/auth/login_with_password_POST.ts'
import { handle as handleRegisterPost } from './endpoints/auth/register_with_password_POST.ts'
import { handle as handleSlugGet } from './endpoints/post/slug_GET.ts'
import { handle as handleCreatePost } from './endpoints/post/create_POST.ts'
import { handle as handleUpdatePost } from './endpoints/post/update_PUT.ts'
import { handle as handleDeletePost } from './endpoints/post/delete_DELETE.ts'
import { handle as handleLikePost } from './endpoints/post/like_POST.ts'
import { handle as handleCommentPost } from './endpoints/post/comment_POST.ts'
import { handle as handleEventCreate } from './endpoints/event/create_POST.ts'
import { handle as handleEventNext } from './endpoints/event/next_GET.ts'
import { handle as handleEventsList } from './endpoints/events/list_GET.ts'
import { handle as handleUserSearch } from './endpoints/user/search_GET.ts'
import { handle as handleUserId } from './endpoints/user/id_GET.ts'
import { handle as handleUserComments } from './endpoints/user/comments_GET.ts'
import { handle as handleUserCreatedPosts } from './endpoints/user/created-posts_GET.ts'
import { handle as handleUserLikedPosts } from './endpoints/user/liked-posts_GET.ts'








const app = new Hono().basePath('/functions/v1/api')

// Log every request path for debugging
app.use('*', async (c, next) => {
    console.log(`[${c.req.method}] Path: ${c.req.path} | URL: ${c.req.url}`)
    await next()
})

app.use(
    '*',
    cors({
        origin: (origin) => {
            if (!origin) return 'https://toastaspiring.github.io';
            const allowedOrigins = [
                'https://toastaspiring.github.io',
                'http://localhost:5173',
                'http://localhost:4173'
            ];
            if (allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
                return origin;
            }
            return 'https://toastaspiring.github.io';
        },
        allowHeaders: ['Content-Type', 'Authorization', 'Upgrade-Insecure-Requests', 'apikey', 'X-Client-Info', 'X-Requested-With'],
        allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
        exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
        maxAge: 600,
        credentials: true,
    })
)

// Explicit OPTIONS handler for preflight checks
app.options('*', (c) => {
    return c.body(null, 204)
})

// Debug 404 handler
app.notFound((c) => {
    return c.json({
        error: 'Not Found',
        message: 'Route not found',
        path: c.req.path,
        url: c.req.url,
        method: c.req.method,
    }, 404)
})

app.get('/', (c) => {
    return c.text('ToastyDevBlog API is running on Supabase Edge Functions!')
})

// Posts Route
app.get('/posts', async (c) => {
    const response = await handlePostsGet(c.req.raw)
    return response
})

app.get('/post/by-slug/:slug', async (c) => {
    const response = await handleSlugGet(c.req.raw)
    return response
})

app.post('/post/create', async (c) => {
    const response = await handleCreatePost(c.req.raw)
    return response
})

app.put('/post/update', async (c) => {
    const response = await handleUpdatePost(c.req.raw)
    return response
})

app.delete('/post/delete', async (c) => {
    const response = await handleDeletePost(c.req.raw)
    return response
})

app.post('/post/like', async (c) => {
    const response = await handleLikePost(c.req.raw)
    return response
})

app.post('/post/comment', async (c) => {
    const response = await handleCommentPost(c.req.raw)
    return response
})

app.post('/event/create', async (c) => {
    const response = await handleEventCreate(c.req.raw)
    return response
})

app.get('/event/next', async (c) => {
    const response = await handleEventNext(c.req.raw)
    return response
})

app.get('/events/list', async (c) => {
    const response = await handleEventsList(c.req.raw)
    return response
})

// User Routes
app.get('/users/search', async (c) => {
    const response = await handleUserSearch(c.req.raw)
    return response
})

app.get('/users/:id', async (c) => {
    const response = await handleUserId(c.req.raw)
    return response
})

app.get('/user/comments', async (c) => {
    const response = await handleUserComments(c.req.raw)
    return response
})

app.get('/user/created-posts', async (c) => {
    const response = await handleUserCreatedPosts(c.req.raw)
    return response
})

app.get('/user/liked-posts', async (c) => {
    const response = await handleUserLikedPosts(c.req.raw)
    return response
})






app.get('/auth/session', async (c) => {
    const response = await handleSessionGet(c.req.raw)
    return response
})

app.post('/auth/login_with_password', async (c) => {
    const response = await handleLoginPost(c.req.raw)
    return response
})

app.post('/auth/register_with_password', async (c) => {
    const response = await handleRegisterPost(c.req.raw)
    return response
})


Deno.serve(app.fetch)
