# Transparent Agent Hub Backend

This is the backend API server for the Transparent Agent Hub, providing AI agent interaction capabilities.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the setup script
cp setup-and-run.js .env

# Edit .env file with your API keys
nano .env
```

**Required Environment Variables:**
- `GOOGLE_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (development/production)

### 3. Get Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing
3. Generate an API key
4. Add it to your `.env` file

### 4. Start the Server

**Option A: Using the setup script (recommended)**
```bash
npm run setup
```

**Option B: Manual start**
```bash
npm run dev    # Development mode with auto-reload
npm start      # Production mode
```

### 5. Verify the Server
The server should be running at `http://localhost:8080`

## API Endpoints

- `POST /api/agents/:agentId/interact` - Interact with an AI agent
- `GET /api/agents` - List available agents
- `GET /api/agents/:agentId` - Get agent details

## Troubleshooting

### "Connection Refused" Error
If you see connection errors in the frontend:
1. Make sure the backend is running (`npm run dev`)
2. Check that port 8080 is not blocked
3. Verify your `.env` file has the correct API keys

### "Missing API Key" Error
1. Ensure `GOOGLE_API_KEY` is set in your `.env` file
2. Restart the server after updating environment variables

## Development

- **Auto-reload**: `npm run dev` uses nodemon for automatic server restart
- **Logs**: Check `server.log` for server logs
- **Environment**: Development mode enables detailed error messages

## Production Deployment

For production deployment, see the deployment scripts in the root directory.
