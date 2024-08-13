FROM node:18-slim AS npm-builder

# Install curl for health checks
RUN apt-get update && apt-get install -y curl

COPY package*.json ./app/
WORKDIR /app
RUN npm install

# Copy the application directory (excludes .dockerignore contents).
COPY / ./

# Define an argument for the NPM build task.
ARG NPM_BUILD_TASK="build"

# Use the argument in the build step.
RUN npm run ${NPM_BUILD_TASK}

EXPOSE 4242
CMD [ "node", "dist/index.js" ]
