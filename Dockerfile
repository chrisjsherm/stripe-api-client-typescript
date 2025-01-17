FROM node:18-slim AS npm-builder

# Install curl for health checks
RUN apt-get update && apt-get install -y curl

# Copy package.json and lock files for dependencies installation.
COPY package*.json ./app/
WORKDIR /app
RUN npm install

# Copy the application directory (excludes .dockerignore contents).
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Define arguments for the NPM build task to use as environment variables.
ARG AUTH_ADMIN_EMAIL
ARG AUTH_ADMIN_PASSWORD
ARG AUTH_API_KEY__APP_SERVER
ARG AUTH_API_KEY__SUPER_ADMIN
ARG AUTH_APPLICATION_ID
ARG AUTH_APPLICATION_NAME
ARG AUTH_ASYMMETRIC_KEY_ID
ARG AUTH_CONTAINER_URL
ARG AUTH_DATABASE_PASSWORD
ARG AUTH_DATABASE_USERNAME
ARG AUTH_DEFAULT_TENANT_ID
ARG AUTH_EMAIL_HOST
ARG AUTH_EMAIL_PORT
ARG AUTH_EMAIL_TEMPLATE_FROM_ADDRESS
ARG AUTH_EMAIL_TEMPLATE_FROM_NAME
ARG AUTH_EXTERNAL_URL
ARG AUTH_FUSIONAUTH_APP_KICKSTART_FILE
ARG AUTH_FUSIONAUTH_APP_MEMORY
ARG AUTH_FUSIONAUTH_APP_RUNTIME_MODE
ARG AUTH_GROUP__ORGANIZATION_ADMINISTRATORS_ID
ARG AUTH_GROUP__SUBSCRIPTION_BUSINESS_ANNUAL_ID
ARG AUTH_GROUP__SUBSCRIPTION_STARTUP_ANNUAL_ID
ARG AUTH_GROUP_ID__ORGANIZATION_ADMINISTRATORS
ARG AUTH_GROUP_ID__PATIENTS
ARG AUTH_GROUP_ID__SUBSCRIPTION_BUSINESS_ANNUAL_REV_0
ARG AUTH_GROUP_ID__SUBSCRIPTION_STARTUP_ANNUAL_REV_0
ARG AUTH_LOGOUT_URL
ARG AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_ID
ARG AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_NAME
ARG AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_ID
ARG AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_NAME
ARG AUTH_WEBHOOK_URL
ARG AWS_ACCESS_KEY_ID
ARG AWS_REGION
ARG AWS_SECRET_ACCESS_KEY
ARG CAPTCHA_ENABLED
ARG CAPTCHA_SECRET_KEY_AWS_SSM_PARAMETER_PATH
ARG CUSTOMER_CONTACT_SUBJECT_SUFFIX
ARG CUSTOMER_CONTACT_TO_AWS_SES_VALIDATED_EMAIL
ARG DB_HOST
ARG DB_NAME
ARG DB_PASSWORD
ARG DB_PORT
ARG DB_USERNAME
ARG OPENSEARCH_INITIAL_ADMIN_PASSWORD
ARG PG_ADMIN_DEFAULT_USER_EMAIL
ARG PG_ADMIN_DEFAULT_USER_PASSWORD
ARG PG_ADMIN_PORT
ARG STRIPE_API_KEY
ARG STRIPE_WEBHOOK_SIGNING_KEY
ARG UI_ORIGIN
ARG WEB_API_PAYLOAD_LIMIT
ARG WEB_API_REQUEST_TIMEOUT_MS
ARG WEB_API_RETRY_DELAY_MS
ARG WEB_API_SERVER_PORT
ARG WEB_API_UPSERT_SEED_DATA

# Allow modifying which NPM task gets called to build.
# e.g., `docker build --build-arg NPM_BUILD_TASK=build:local -t medspaah:local .`
ARG NPM_BUILD_TASK="build"

# Build the application.
RUN npm run ${NPM_BUILD_TASK}

# Base image for the web server stage.
FROM node:18-slim AS web-server

# Copy package.json and lock files and install only production dependencies.
COPY package*.json ./app/
WORKDIR /app
RUN npm install --omit=dev

# Copy the built application files from the npm-builder stage.
COPY --from=npm-builder /app/dist ./dist

# Expose the server's listening port.
EXPOSE 4242

# Command to start the server.
CMD [ "node", "dist/index.js" ]