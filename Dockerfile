# Use Node.js as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and angular.json first
COPY package*.json angular.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code (including src/, public/, etc.)
COPY src/ ./src/
COPY public/ ./public/
COPY dist/ ./dist/
COPY tsconfig.json ./

# Build Angular SSR app
RUN npm run build

# Expose the port your server runs on (change if needed)
EXPOSE 4000

# Start the SSR server
ENTRYPOINT ["npm", "run", "server"]