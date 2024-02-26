import { IBuildConfiguration } from "./data-models/build-configuration.interface";

/**
 * Configuration for the development build environment.
 * Modify the values below unless they are already using process.env['VAR'].
 */
export const developmentConfiguration: Omit<
  IBuildConfiguration,
  "httpRequestTimeoutMs" | "port"
> = {
  isDebug: true,
  auth: {
    apiSecret: process.env.AUTH_FUSION_AUTH_API_SECRET,
    url: process.env.AUTH_BASE_URL,
  },
  cors: {
    allowedOrigins: ["http://localhost:4200"],
  },
  payments: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSigningSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};
