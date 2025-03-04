FROM node:18-alpine

WORKDIR /app

# Copy only package.json explicitly
COPY package.json ./package.json

# Install dependencies
RUN npm install

# Copy application code and static files
COPY src/ ./src/
COPY .env ./.env

# Ensure pages directory exists and has correct permissions
RUN mkdir -p ./src/pages && chmod 755 ./src/pages

# Expose port
EXPOSE 3000

# Use nodemon for hot-reloading in development
CMD ["npm", "run", "dev"] 