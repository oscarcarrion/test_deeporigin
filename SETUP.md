# URL Shortener Setup Guide

This guide will help you set up and run the URL Shortener application locally or with Docker.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- Supabase account and project

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd url-shortener
npm install
```

### 2. Database Setup

1. Create a [Supabase](https://supabase.com) account and new project
2. Copy the SQL schema from `backend/src/config/database.ts` 
3. Run the SQL in your Supabase SQL editor to create tables and policies
4. Note your project URL and anon key from Settings > API

### 3. Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
# edit .env with Supabase credentials
```

#### Frontend Environment 
```bash
cd frontend
cp .env.example .env
# edit .env with Supabase credentials
```

#### Root Environment (for Docker)
```bash
cp .env.example .env
# edit .env with Supabase credentials
```

### 4. Development Mode

```bash
# start both frontend and backend
npm run dev

# or start individually:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### 5. Docker Deployment

```bash
# easy deployment with Docker
./scripts/deploy.sh

# or manually:
docker-compose up --build
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as SUPABASE_URL (for frontend) | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as SUPABASE_ANON_KEY (for frontend) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | `3001` |
| `BASE_URL` | Backend base URL | `http://localhost:3001` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API URL for frontend | `http://localhost:3001` |

## Database Schema

The application requires these tables in Supabase:

- `urls` - Stores shortened URLs
- `url_visits` - Tracks URL visits for analytics

Run the SQL from `backend/src/config/database.ts` in your Supabase SQL editor.

## Features

**Core Features**
- URL shortening with unique slug generation
- Redirect shortened URLs to original destinations  
- 404 handling for invalid slugs
- Database storage of all URLs
- List view of all saved URLs

 **Bonus Features**
- User authentication and accounts
- URL validation with error handling
- One-click copy to clipboard
- Custom slug modification
- Visit tracking and analytics
- Rate limiting protection
- Modern, responsive UI
- Docker support

## API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /:slug` - Redirect to original URL
- `POST /api/shorten` - Create short URL (rate limited)
- `GET /api/urls` - Get public URLs

### Authenticated Endpoints
- `GET /api/urls` - Get user's URLs
- `PUT /api/urls/:id` - Update URL slug
- `DELETE /api/urls/:id` - Delete URL
- `GET /api/analytics/:slug` - Get URL analytics

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure all required environment variables are set
   - Check that .env files exist in both frontend and backend directories

2. **Database connection errors**
   - Verify Supabase credentials are correct
   - Ensure database tables are created using the provided SQL schema

3. **CORS errors**
   - Check that FRONTEND_URL is correctly set in backend environment
   - Ensure Supabase RLS policies are properly configured

4. **Docker build failures**
   - Ensure Docker and Docker Compose are installed
   - Try `docker-compose down --volumes` to reset volumes

### Getting Help

- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure your Supabase project is active and accessible
- Check that all dependencies are installed with `npm install`

## Deployment

### Local Development
```bash
npm run dev
```

### Docker Production
```bash
docker-compose up --build -d
```

### Environment-Specific Notes

- **Development**: Hot reload enabled, detailed error messages
- **Production**: Optimized builds, security headers, rate limiting

