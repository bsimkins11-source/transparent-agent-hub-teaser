# Use Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy the entire frontend source
COPY frontend/ .

# Build the React app with Vite
RUN npm run build

# Install Express for serving (production only)
RUN npm install express --production

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Show what we have
RUN ls -la
RUN ls -la build/

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
