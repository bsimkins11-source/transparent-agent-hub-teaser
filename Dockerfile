# Use Node.js LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the entire frontend directory
COPY frontend/ .

# Build the React app
RUN npm run build

# Install Express for serving
RUN npm install express

# Verify the build directory exists and show contents
RUN ls -la
RUN ls -la build/

# Expose port (optional, not required by Cloud Run)
EXPOSE 8080

# Start app
CMD [ "node", "server.js" ]
