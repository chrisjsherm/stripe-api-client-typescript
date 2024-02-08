import { IBuildConfiguration } from "./data-models/build-configuration.interface";

/**
 * Configuration for the production build environment.
 * Modify the values below unless they are already using process.env['VAR'].
 */
export const productionConfiguration: Omit<
  IBuildConfiguration,
  "httpRequestTimeoutMs" | "port"
> = {
  cors: {
    allowedOrigins: [],
  },
  payments: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSigningSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};
