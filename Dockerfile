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

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
