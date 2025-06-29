# Use a pinned, reliable Node.js version
FROM node:24.2

# Create and switch to the working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of your app
COPY . .

# Expose the port your app uses
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
