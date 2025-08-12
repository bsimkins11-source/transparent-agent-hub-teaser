# Use Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies with legacy peer deps to avoid conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY frontend/ .

# Build the app
RUN npm run build

# Verify build output
RUN echo "=== Build completed successfully ==="
RUN ls -la
RUN echo "=== Dist directory contents ==="
RUN ls -la dist/

# Install Express for the server
RUN npm install express

# Copy server.js to the root of the app
COPY frontend/server.js ./

# Clean up dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
