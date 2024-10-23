# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy root package.json and package-lock.json
COPY package.json package-lock.json ./

# Install root dependencies
RUN npm install

# Copy frontend package.json and package-lock.json
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Install frontend dependencies
RUN npm --prefix frontend install

# Copy backend package.json and package-lock.json
COPY backend/package.json backend/package-lock.json ./backend/

# Install backend dependencies
RUN npm --prefix backend install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the app
CMD ["npm", "start"]
