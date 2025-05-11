# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json to the working directory
COPY package*.json ./

# Clean install: remove both package-lock.json and node_modules, then install fresh
RUN rm -f package-lock.json && \
  rm -rf node_modules && \
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

# Install system dependencies required for Chromium
RUN apt-get install -y \
  libnss3 \
  libnspr4 \
  libdbus-1-3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libxkbcommon0 \
  libatspi2.0-0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils

# Create virtual environment
RUN python3 -m venv /opt/venv

# Upgrade pip and install Python dependencies
RUN /opt/venv/bin/pip install --upgrade pip && \
  /opt/venv/bin/pip install -r requirements.txt && \
  /opt/venv/bin/pip install setuptools && \
  /opt/venv/bin/python -m playwright install chromium && \
  /opt/venv/bin/python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Ensure the virtual environment activation script has execution permissions
RUN chmod +x /opt/venv/bin/activate

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8600

# Command to run the application
CMD [ "npm", "start" ]
