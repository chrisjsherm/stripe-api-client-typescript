FROM node:18-slim AS npm-builder

# Install curl for health checks
RUN apt-get update && apt-get install -y curl

COPY package*.json ./app/
WORKDIR /app
RUN npm install

# Copy the application directory (excludes .dockerignore contents).
COPY / ./

# Build project.
RUN npm run build

EXPOSE 4242
CMD [ "node", "dist/index.js" ]
