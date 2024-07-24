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
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip
RUN /opt/venv/bin/pip install -r requirements.txt

# Ensure the virtual environment activation script has execution permissions
RUN chmod +x /opt/venv/bin/activate

# Build the application
RUN npm run build

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 8600

# Command to run the application
CMD [ "npm", "start" ]
