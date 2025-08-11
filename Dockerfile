# Use Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build the app
RUN npm run build

# Install Express
RUN npm install express

# Debug: Show what we have
RUN echo "=== Container contents ==="
RUN ls -la
RUN echo "=== Build directory contents ==="
RUN ls -la build/
RUN echo "=== Package.json ==="
RUN cat package.json

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
