FROM node:18-alpine

WORKDIR /app

# Install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Use nodemon for hot-reloading in development
CMD ["npm", "run", "dev"] 