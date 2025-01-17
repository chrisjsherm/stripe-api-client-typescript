# Stripe API Client (TypeScript)

Web API for the MedSpaah platform. Written in TypeScript.

## Develop

These instructions run the web API server via an NPM task and other services
via Docker containers. To run the UI, clone the
[UI repo](https://github.com/chrisjsherm/ng-med-spa) and follow its README.
Then complete the following:

1. Open a terminal and run:
   ```shell
   docker compose --profile debug --profile inspect_db up -d
   ```
2. Open a terminal and run: `npm start`
3. Open a terminal and run (skip if done recently): `stripe login`
4. After logging in to Stripe, run:

   ```
   stripe listen --forward-to localhost:4242/webhooks/stripe
   ```

   > Verify the webhook signing secret in `.env` matches the one displayed in the terminal.

   > Open another terminal and run: `stripe trigger --help` to see a list of
   > Stripe events you can generate for testing purposes.

To stop and remove the Docker containers:

```shell
docker compose --profile debug --profile inspect_db down
```

To also remove the Docker volumes:

```shell
docker compose --profile debug --profile inspect_db down -v
```

To stop the containers without removing them:

```shell
docker compose --profile debug --profile inspect_db stop
```

## Configuration

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Install Docker Desktop.
3. Install the AWS CLI.
4. Install Terraform.
5. Copy `.env.example` to `.env` and fill in the values with your configuration.

### FusionAuth

This application uses [FusionAuth](https://fusionauth.io/docs/quickstarts/quickstart-javascript-angular-web)
for authentication. Much of the development instance configuration is handled by
`./.fusion-auth/kickstart.json`, but this only runs the first time the container
starts.

To access the local FusionAuth instance, visit the [FusionAuth Dashboard](http://localhost:9011/admin/)
instance created by the `docker-compose.yml` file.

#### Modify FusionAuth configuration

To make changes to an existing FusionAuth instance, use Terraform.

To modify an existing resource, import the resource you want to modify, just
as we have done with the default tenant (see `/.fusion-auth/terraform/tenants.tf`).

Terraform environment variables are set using the `TF_VAR_` syntax and loaded
from the `.env` files via `dotenvx`.

To get started, navigate to the terraform directory and run:
`npx dotenvx run -f ../../.env -- terraform init`

Before adding or modifying resources, run:
`npx dotenvx run -f ../../.env -- terraform plan`

To apply changes, run:
`npx dotenvx run -f ../../.env -- terraform apply`

### Stripe

Payments are facilitated via the Stripe API.

### PostgreSQL

The Postgres server runs one database for application data and another for
FusionAuth data.

The first time you run `docker compose` via `npm start`, the `postgres`
container will create a database and user with the environment parameters
specified in `.env`. The container will not automatically create these resources
on subsequent starts without deleting the volume attached to the container.

To take direct action on the database, start a `bash` shell inside the container:

```
docker exec -it <container-name> bash
```

Once inside the container, launch `psql` with the POSTGRES_USER specified in
`docker-compose.yml`:

```
psql -U <username>
```

Create a new database:

```
CREATE DATABASE new_database_name;
```

Create a new user:

```
CREATE USER new_user WITH ENCRYPTED PASSWORD 'password'
```

### pgAdmin

To start the pgAdmin service, you need to run `docker compose` with the
`--profile inspect_db` option.

To connect to the pgAdmin database management tool, visit
http://localhost:PG_ADMIN_PORT (default port is 5050).
The port for the URL and credentials to log in are specified in the `.env` file.

Once connected to pgAdmin, add a server. On the "Connection" tab:

1. Specify `db` as the "Host name/address"
2. Change the "Username" and "Password" fields to match your `DB_USERNAME` and
   `DB_PASSWORD` environment variables.

### Mail Hog

To facilitate email services in development, we leverage an instance of the
Mail Hog SMTP server. You can access the Mail Hog container by visiting http://localhost:8025.

### Database Changes & Migrations

Database migrations are run automatically when the Web API server starts up and
connects to the database.

To modify the data model:

1. Start the database.
2. Generate a migration (replace \<name\> with a description):

   ```
   npx typeorm-ts-node-commonjs migration:generate ./src/db/migrations/<name> -d ./src/db/data-source.ts --pretty
   ```

3. Import the migration to `./src/db/data-source.ts` and add it to the end of the
   `migrations` array.

4. Run the migration (if running server has not already run automatically):

   ```
   npx typeorm-ts-node-commonjs migration:run -d ./src/db/data-source.ts
   ```

### Cloudflare

We use Cloudflare's Turnstile service to prevent spam from bots. After configuring
Turnstile on the Cloudflare dashboard, you must add the secret key to AWS Parameter
Store. Be sure to update the AWS and Turnstile `.env` variables.

### nginx

We use nginx as a reverse proxy.

1. Place your certificate, private key, and root certificate files in the `/nginx/ssl` directory. Update the `nginx.conf` file to match the names of these files.
2. Generate a Diffie-Hellman key for the ssl directory:
   ```shell
   cd /nginx/ssl
   openssl dhparam -out dhparam.pem 4096
   ```

### Production emulator

In production, all services, including the web API, run in Docker containers.
To emulate this environment while developing the UI locally, following these instructions:

1. Rename `.env.production.local.example` to `.env.production.local`, changing
   values as necessary.
2. Build the web API Docker image:

   ```shell
   docker build --build-arg NPM_BUILD_TASK=build:local -t medspaah:local .
   ```

3. Push the image to ECR: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

4. Modify your local `/etc/hosts` to include these entries:

   ```shell
   127.0.0.0   api.your-domain.com
   127.0.0.0   app.your-domain.com
   127.0.0.0   auth.your-domain.com
   ```

5. Adjust the `nginx/nginx.conf` file to match the DNS configuration.

6. Start the services:

   ```shell
   # See the file combined with environment variables.
   docker compose --env-file .env --env-file .env.production.local  \
      --profile prod --profile debug config

   # Create the services.
   docker compose --env-file .env --env-file .env.production.local \
      --profile prod --profile debug up
   ```

7. Open a terminal and run (skip if done recently): `stripe login`

8. After logging in to Stripe, run:

   ```shell
   stripe listen --forward-to localhost:4242/webhooks/stripe
   ```

   > Verify the webhook signing secret in `.env` matches the one displayed in the terminal.

   > Open another terminal and run: `stripe trigger --help` to see a list of
   > Stripe events you can generate for testing purposes.

9. After starting the stack, you will need to access each subdomain in your browser directly and proceed past the warning about an invalid certificate before being able to successfully run the application.
   - api.your-domain.com/health
   - auth.your-domain.com/admin

To stop and remove the containers:

```shell
docker compose --profile prod --profile debug down
```

## Deploy

### CloudFormation

1. In the AWS console, <b>visit SES to create an identity for your domain</b>. You will
   need to go through the DNS verification process and then create an SMTP user.

2. To get started with AWS CloudFormation, you need to create an EC2 key pair
   on your computer and add it to AWS EC2 in the region you want to use. You can
   add the key pair under <b>EC2 > Network & Security > Key Pairs</b>

3. Copy `.env.production.remote.example` to `.env.production.remote` and replace
   values, as necessary. If you have not already done this with the other `.env`
   files, do so now.

4. Copy `cloud-formation/params.example.json` to `cloud-formation/params.json`,
   updating the values.

5. Run from the root directory:

   ```shell
   aws cloudformation create-stack --stack-name medspaah-com \
      --template-body file://cloud-formation/template.yml \
      --parameters file://cloud-formation/params.json \
      --capabilities CAPABILITY_IAM
   ```

6. Configure Stripe webhook. The endpoint will be https://api.your-domain/webhooks/stripe and the events to send are:

   - customer.created
   - payment_intent.succeeded
   - payment_intent.payment_failed

   > Once created, you will need to update the `.env.production.remote` configuration with the webhook signing key.

7. On your <u>local machine</u>, build the web API Docker image:

   ```shell
   docker build -t medspaah .
   ```

8. Push the image to ECR: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

9. Configure your domain to point to the EC2 instance's IP address with your
   DNS provider using an "A" record. The <b>EC2 IP address will be in the Outputs
   tab of the CloudFormation stack</b> in the AWS Console. Use the IP address as the target value in the DNS entry. You will need to create an entry for each subdomain:

   - api
   - app
   - auth

10. From your <u>local machine</u>, copy files to the instance. The .pem file is
    the key pair you created and added to EC2 via the AWS console. The key pair must be in the same region as your CloudFormation stack.

    ```shell
    printf "%s" "EC2 IP address: "
    read ec2Ip

    scp -i ~/.ssh/aws-ec2.pem -rp .fusion-auth ec2-user@${ec2Ip}:/home/ec2-user

    scp -i ~/.ssh/aws-ec2.pem docker-compose.yml ec2-user@${ec2Ip}:/home/ec2-user

    scp -i ~/.ssh/aws-ec2.pem .env ec2-user@${ec2Ip}:/home/ec2-user

    scp -i ~/.ssh/aws-ec2.pem .env.production.remote ec2-user@${ec2Ip}:/home/ec2-user

    scp -i ~/.ssh/aws-ec2.pem -rp nginx ec2-user@${ec2Ip}:/home/ec2-user
    ```

11. Run the NPM build task for the UI repository and copy files to EC2:

    ```shell
    sh ../ng-med-spa/deploy-to-aws.sh
    ```

12. SSH into the EC2 instance:

    ```shell
    ssh -i ~/.ssh/aws-ec2.pem ec2-user@${ec2Ip}
    ```

13. On the <u>EC2 instance</u>, pull the image from ECR.

    ```shell
    printf "%s" "AWS region: "
    read region

    printf "%s" "AWS account ID: "
    read accountId

    printf "%s" "ECR image name: "
    read imageName

    aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${accountId}.dkr.ecr.${region}.amazonaws.com;
    docker pull ${accountId}.dkr.ecr.${region}.amazonaws.com/${imageName};
    ```

14. Start the Docker services:

    ```shell
    # See the file combined with environment variables.
    docker-compose --env-file .env --env-file .env.production.remote \
      --profile prod config

    docker-compose --env-file .env --env-file .env.production.remote --profile prod up -d
    docker-compose logs -f # Or: docker-compose logs <service-name>
    ```

### Deploy application updates

> Warning: this should not be done with users active

1. Update package.json and .env.production.remote with the new version.

2. On your <u>local machine</u>, build the web API Docker image:

   ```shell
   docker build -t medspaah:<version> .
   ```

3. Push the image to ECR: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

4. Run the NPM build task for the UI repository and copy files to EC2:

   ```shell
   sh ../ng-med-spa/deploy-to-aws.sh
   ```

5. From your <u>local machine</u>, copy files to the instance. The .pem file is
   the key pair you created and added to EC2 via the AWS console. The key pair must be in the same region as your CloudFormation stack.

   ```shell
   printf "%s" "EC2 IP address: "
   read ec2Ip

   scp -i ~/.ssh/aws-ec2.pem -rp .fusion-auth ec2-user@${ec2Ip}:/home/ec2-user

   scp -i ~/.ssh/aws-ec2.pem docker-compose.yml ec2-user@${ec2Ip}:/home/ec2-user

   scp -i ~/.ssh/aws-ec2.pem .env ec2-user@${ec2Ip}:/home/ec2-user

   scp -i ~/.ssh/aws-ec2.pem .env.production.remote ec2-user@${ec2Ip}:/home/ec2-user

   scp -i ~/.ssh/aws-ec2.pem -rp nginx ec2-user@${ec2Ip}:/home/ec2-user
   ```

6. SSH into the EC2 instance:

   ```shell
   ssh -i ~/.ssh/aws-ec2.pem ec2-user@${ec2Ip}
   ```

7. On the <u>EC2 instance</u>, pull the image from ECR.

   ```shell
   printf "%s" "AWS region: "
   read region

   printf "%s" "AWS account ID: "
   read accountId

   printf "%s" "ECR image name: "
   read imageName

   aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${accountId}.dkr.ecr.${region}.amazonaws.com;
   ```

8. Update the Docker services:

   ```shell
   # See the file combined with environment variables.
   docker-compose --env-file .env --env-file .env.production.remote \
     --profile prod config

   docker-compose --env-file .env --env-file .env.production.remote --profile prod pull
   docker-compose --env-file .env --env-file .env.production.remote --profile prod up -d
   docker-compose logs -f # Or: docker-compose logs <service-name>
   ```

9. Clear Cloudflare cache

#### Update the stack

Update the stack in a single step:

```shell
aws cloudformation update-stack --stack-name medspaah-com \
   --template-body file://cloud-formation/template.yml \
   --parameters file://cloud-formation/params.json \
   --capabilities CAPABILITY_IAM
```

Create change set before updating:

1. Create the change set:

   ```shell
   aws cloudformation create-change-set \
      --stack-name medspaah-com \
      --change-set-name my-change-set \
      --template-body file://cloud-formation/template.yml \
      --parameters file://cloud-formation/params.json \
      --capabilities CAPABILITY_IAM \
      --change-set-type UPDATE
   ```

2. Describe the change set:

   ```shell
   aws cloudformation describe-change-set \
      --stack-name medspaah-com \
      --change-set-name my-change-set
   ```

3. Execute the change set:

   ```shell
   aws cloudformation execute-change-set \
      --stack-name medspaah-com \
      --change-set-name my-change-set
   ```

#### Delete the stack

```shell
aws cloudformation delete-stack --stack-name medspaah-com
```
