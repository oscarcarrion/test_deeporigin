# URL Shortener

A modern, full-stack URL shortener application built with React, TypeScript, and Node.js.

## Features

### Core Features
- URL shortening with unique slug generation
- Redirect shortened URLs to original destinations
- 404 handling for invalid slugs
- Database storage of all URLs
- List view of all saved URLs

### Bonus Features
- User authentication and accounts
- URL validation with error handling
- One-click copy to clipboard
- Custom slug modification
- Visit tracking and analytics
- Rate limiting protection
- Analytics dashboard
- Modern, responsive UI
- Docker support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Docker

## Project Structure

```
url-shortener/
├── frontend/          # Next.js React application
├── backend/           # Express.js API server
├── docker-compose.yml # Docker configuration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- Docker (optional)

### Environment Setup
1. Copy `.env.example` files in both frontend and backend directories
2. Fill in your Supabase credentials
3. Set up your Supabase database tables (see backend/README.md)

### Development
```bash
# install dependencies
npm install

# start both frontend and backend
npm run dev

# or start individually
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### Docker
```bash
# build and run with Docker Compose
docker-compose up --build
```

## API Endpoints

- `POST /api/shorten` - Create a shortened URL
- `GET /api/urls` - Get all URLs for authenticated user
- `GET /api/analytics/:slug` - Get analytics for a URL
- `GET /:slug` - Redirect to original URL
- `PUT /api/urls/:id` - Update URL slug
- `DELETE /api/urls/:id` - Delete URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 