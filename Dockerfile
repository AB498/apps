# Use the official Node.js image
FROM node:20

# Install Git
RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN groupadd -g 10001 appgroup && \
    useradd -m -u 10001 -g appgroup appuser

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Change ownership of the working directory to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Expose the app port
EXPOSE 8080

# Start the application
CMD ["npx", "nodemon"]
