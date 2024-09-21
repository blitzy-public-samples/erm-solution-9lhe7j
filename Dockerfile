# Build stage
FROM node:14-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:14-alpine AS production
WORKDIR /app

# Set environment variable
ENV NODE_ENV=production

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/backend/server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Add labels
LABEL maintainer="ERM Experts <support@ermexperts.com>"
LABEL version="1.0"
LABEL description="ERM Experts Risk Management Platform"

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S appuser && adduser -u 1001 -S appuser -G appuser
USER appuser

# Clean up
RUN npm cache clean --force