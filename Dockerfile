# Use Node.js LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy rest of the frontend app
COPY frontend/ .

# Build the React app
RUN npm run build

# Install Express for serving
RUN npm install express

# Copy server file
COPY frontend/server.js ./

# Expose port (optional, not required by Cloud Run)
EXPOSE 8080

# Start app
CMD [ "node", "server.js" ]
