FROM node:18-alpine

WORKDIR /app

# Copy only package.json explicitly
COPY package.json ./package.json

# Install dependencies
RUN npm install

# Copy only the src directory for the application code
COPY src/ ./src/
COPY .env ./.env

# Expose port
EXPOSE 3000

# Use nodemon for hot-reloading in development
CMD ["npm", "run", "dev"] 