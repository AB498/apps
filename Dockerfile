# Use the official Node.js image as the base image
FROM node:20

# Install Git
RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files to install dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the port the app runs on (adjust if different)
EXPOSE 8080

# Start the application using nodemon if nodemon.json exists
CMD ["npx", "nodemon"]
