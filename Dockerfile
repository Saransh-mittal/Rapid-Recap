# Use the official Playwright image which includes Node.js and Browsers
# This is essential because the app uses Playwright for scraping
FROM mcr.microsoft.com/playwright:v1.48.1-jammy

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json files first to leverage Docker cache
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install Node.js dependencies
# We install in the root (if any), client, and server
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy Python requirements and install them
COPY server/requirements.txt ./server/
# Create a virtual environment and install dependencies
RUN python3 -m venv /app/server/venv
RUN . /app/server/venv/bin/activate && pip install -r server/requirements.txt
# Install NLTK data
RUN . /app/server/venv/bin/activate && python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Copy the rest of the application code
COPY . .

# Build the React client
RUN cd client && npm run build

# Expose the port the app runs on
ENV PORT=3000
EXPOSE 3000

# Set environment variables for Python to use the venv
ENV VIRTUAL_ENV=/app/server/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Start the server
# We use the "server" script from the root package.json or directly run the server
WORKDIR /app/server
CMD ["node", "app.js"]
