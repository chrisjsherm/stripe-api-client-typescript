# Stripe API Client (TypeScript)

Web server for interacting with the Stripe API. Written in TypeScript.

## Configuration

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Copy `.env.example` as `.env` and fill in the values with your configuration.

### FusionAuth

Create an API key for the `.env` file with access to the following:

- /api/group/member POST DELETE
- /api/user GET
- /api/user/verify-email PUT

Create a Group for the `.env` file named "Subscription: Basic".

Configure a Webhook pointing to this server at the path `/webhooks/fusion-auth`
with `user.email.verified` enabled.

- Configure your tenant to have its `user.email.verified` webhook enabled and
  set the transaction so that all webhooks must succeed.

### Stripe

PaymentIntent objects should have a metadata entry with a key of `customer_id`
with the value matching the `id` property of the FusionAuth user for which the
PaymentIntent was created.

### PostgreSQL

The first time you run `docker-compose up` via `npm start`, the `postgres`
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

To connect to the pgAdmin database management tool, visit
http://localhost:PG_ADMIN_PORT.
The port for the URL and credentials to log in are specified in the `.env` file.

Once connected to pgAdmin, add a server. On the "Connection" tab:

1. Specify `db` as the "Host name/address"
2. Change the "Username" and "Password" fields to match your `DB_USERNAME` and
   `DB_PASSWORD` environment variables.

## Development

1. Open a terminal and run: `npm start`
2. Open another terminal and run: `stripe login`
3. After logging in, run: `stripe listen --forward-to localhost:4242/webhooks/stripe`
4. Verify the webhook signing secret in `.env` matches the one displayed in the terminal.
5. Open another terminal and run: `stripe trigger --help` to see a list of
   Stripe events you can generate.
