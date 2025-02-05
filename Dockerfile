# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# First, remove package-lock.json and install dependencies fresh
RUN rm -f package-lock.json && \
  npm install && \
  echo "\n=== Verifying connect-s4a installation ===\n" && \
  ls -la node_modules/connect-s4a && \
  echo "\nconnect-s4a version:" && \
  cat node_modules/connect-s4a/package.json | grep version && \
  echo "\nconnect-s4a files:" && \
  ls -R node_modules/connect-s4a

# Copy the rest of the application code to the working directory
COPY . .

# Install Python and required packages
RUN apt-get update && apt-get install -y python3 python3-venv python3-pip
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip
RUN /opt/venv/bin/pip install -r requirements.txt

# Ensure the virtual environment activation script has execution permissions
RUN chmod +x /opt/venv/bin/activate

# Build the application
RUN npm run build

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8600

# Command to run the application
CMD [ "npm", "start" ]
