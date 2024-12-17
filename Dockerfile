FROM node:20

# Install Git
RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN groupadd -g 10001 appgroup && \
    useradd -m -u 10001 -g appgroup appuser

# Use a writable directory as the working directory
USER root
WORKDIR /tmp/app

# Copy files and set permissions
COPY . .
RUN chown -R 10001:10001 /tmp/app

# Move .git to a writable directory
RUN mkdir /tmp/git && cp -r .git /tmp/git
ENV GIT_DIR=/tmp/git

USER 10001

# Install dependencies
RUN npm install

# Expose the app port
EXPOSE 8080

# Start the application
CMD ["npx", "nodemon"]
