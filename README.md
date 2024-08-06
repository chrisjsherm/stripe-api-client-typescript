# Stripe API Client (TypeScript)

Web API for the MedSpaah platform. Written in TypeScript.

## Configuration

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Install Docker.
3. Install the AWS CLI.
4. Copy `.env.example` as `.env` and fill in the values with your configuration.

### FusionAuth

This application uses [FusionAuth](https://fusionauth.io/docs/quickstarts/quickstart-javascript-angular-web)
for authentication. Much of the development instance configuration is handled by
`./.fusion-auth/kickstart.json`.

To access the local FusionAuth instance, visit the [FusionAuth Dashboard](http://localhost:9011/admin/)
instance created by the `docker-compose.yml` file.

### Stripe

Payments are facilitated via the Stripe API.

### PostgreSQL

The Postgres server runs one database for application data and another for
FusionAuth data.

The first time you run `docker compose up` via `npm start`, the `postgres`
container will create a database and user with the environment parameters
specified in `.env`. The container will not automatically create these resources
on subsequent starts without deleting the volume attached to the container.

To take actions on the database later, start a `bash` shell inside the container:

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
Mail Hog SMTP server. You can access Mail Hog by visiting http://localhost:8025.

### Database Changes & Migrations

Database migrations are run automatically when the Web API server starts up and
connects to the database.

1. Generate a migration (replace \<name\> with a description):

```
npx typeorm-ts-node-esm migration:generate ./src/db/migrations/<name> -d ./src/db/data-source.ts --pretty
```

2. Import the migration to `./src/db/data-source.ts` and add it to the end of the
   `migrations` array.

3. Run the migration:

```
npx typeorm-ts-node-esm migration:run -d ./src/db/data-source.ts
```

## Development

These instructions run the web API server locally and the remaining services
via Docker containers. To run the UI, clone the [repo](https://github.com/chrisjsherm/ng-med-spa)
and follow its README.

1. Open a terminal and run: `docker compose up`
2. Open a terminal and run: `npm start`
3. Open a terminal and run (skip if done recently): `stripe login`
4. After logging in, run:

   ```
   stripe listen --forward-to localhost:4242/webhooks/stripe
   ```

5. Verify the webhook signing secret in `.env` matches the one displayed in the terminal.

> Open another terminal and run: `stripe trigger --help` to see a list of
> Stripe events you can generate for testing purposes.

To stop and remove the Docker containers: `docker compose down`
To also remove the Docker volumes: `docker compose down -v`
To stop the containers without removing them: `docker compose stop`

### Production emulator

To emulate production locally, run all services as Docker containers.

1. Rename `.env.production.local.example` to `.env.production.local`, changing
   any values as necessary.
2. Build the web API service image:

   ```shell
   docker compose --profile prod build
   ```

3. Start the services:

   ```shell
   docker compose --env-file .env --env-file .env.production.local \
      --profile prod up
   ```

To stop and remove the containers:

```shell
docker compose --profile prod down
```

## Deployment

### CloudFormation

To get started with AWS CloudFormation, you need to create an EC2 key pair
on your computer and add it to EC2 in the region you want to use via the
AWS console.

You also need to place your Cloudflare Turnstile secret key at the path
configured in the `CAPTCHA_SECRET_KEY_AWS_SSM_PARAMETER_PATH` environment variable.

#### Create stack

1. Run from the root directory:

   ```shell
   aws cloudformation create-stack --stack-name MedSpaahEC2 \
      --template-body file://cloud-formation/template.yml \
      --parameters file://cloud-formation/params.json \
      --capabilities CAPABILITY_IAM
   ```

2. In the AWS console, navigate to the stack and select the "Outputs" tab to find
   the EC2 instance's public IP address.

   From your local terminal, run the command below, replacing the IP address.

   ```shell
   ssh -i ~/.ssh/my-key.pem ec2-user@<ip>
   ```

3. On your <u>local machine</u>, update the values in `.env.production.remote`
   with your instance's IP.

4. On your <u>local machine</u>, build the web API Docker image:

   ```shell
   docker build -t medspaah .
   ```

5. Push the image to ECR: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

6. Update the image for the web-api service in the `docker-compose.yml` file with
   the address of the image you pushed to ECR.

7. From your <u>local machine</u>, copy files to the instance:

   ```shell
   printf "%s" "EC2 IP address: "
   read ec2Ip

   printf "%s" "path to .pem file: "
   read pemFilePath

   scp -i ${pemFilePath} -rp .fusion-auth ec2-user@${ec2Ip}:/home/ec2-user

   scp -i ${pemFilePath} docker-compose.yml ec2-user@${ec2Ip}:/home/ec2-user

   scp -i ${pemFilePath} .env ec2-user@${ec2Ip}:/home/ec2-user

   scp -i ${pemFilePath} .env.production.remote ec2-user@${ec2Ip}:/home/ec2-user
   ```

8. On the <u>EC2 instance</u>, pull the image from ECR.

```shell
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com;
docker pull <aws-account-id>.dkr.ecr.<region>.amazonaws.com/<image-name>:<optional-tag>;
```

10. Start the Docker services:

    ```shell
    docker-compose --env-file .env --env-file .env.production.remote --profile prod up -d
    docker-compose logs -f
    ```

#### Update the stack

Update the stack in a single step:

```shell
aws cloudformation update-stack --stack-name MedSpaahEC2 \
   --template-body file://cloud-formation/template.yml \
   --parameters file://cloud-formation/params.json \
   --capabilities CAPABILITY_IAM
```

Create change set before updating:

1. Create the change set:

   ```shell
   aws cloudformation create-change-set \
      --stack-name MedSpaahEC2 \
      --change-set-name my-change-set \
      --template-body file://cloud-formation/template.yml \
      --parameters file://cloud-formation/params.json \
      --capabilities CAPABILITY_IAM \
      --change-set-type UPDATE
   ```

2. Describe the change set:

   ```shell
   aws cloudformation describe-change-set \
      --stack-name MedSpaahEC2 \
      --change-set-name my-change-set
   ```

3. Execute the change set:

   ```shell
   aws cloudformation execute-change-set \
      --stack-name MedSpaahEC2 \
      --change-set-name my-change-set
   ```
