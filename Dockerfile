# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Install Python and required packages
RUN apt-get update && apt-get install -y python3 python3-venv python3-pip

# Install Redis
RUN apt-get install -y redis-server

# Set up Python virtual environment
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip
RUN /opt/venv/bin/pip install -r requirements.txt

# Ensure the virtual environment activation script has execution permissions
RUN chmod +x /opt/venv/bin/activate

# Build the application
RUN npm run build

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"

# Expose the ports the app and Redis run on
EXPOSE 8600 6379

# Start Redis server and then run the application
CMD service redis-server start && npm start