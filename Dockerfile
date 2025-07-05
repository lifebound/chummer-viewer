FROM node:24.2

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy the rest of your app
COPY . .

# Build frontend assets with Vite
RUN npm run build

# Optionally, remove devDependencies for a smaller image
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "start"]