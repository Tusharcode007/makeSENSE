# MakeSense AI - Setup Instructions

Welcome to the MakeSense AI development environment.

## Prerequisites
- Node.js (v18+)
- npm or yarn

## Installation

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Google API credentials if available:
   ```bash
   cp .env.example .env
   ```

## Running the Application

To start the development server (uses `ts-node-dev` for auto-reloading):
```bash
npm run dev
```

The server will run on port `3000` by default.

### Health Check
```bash
curl http://localhost:3000/health
```

### Send a Mock Message
```bash
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "message": "Check my calendar"}'
```

## Testing
To run the jest unit tests:
```bash
npm test
```

## Build for Production
To compile TypeScript into the `dist/` directory:
```bash
npm run build
```
You can then start it via:
```bash
npm start
```
