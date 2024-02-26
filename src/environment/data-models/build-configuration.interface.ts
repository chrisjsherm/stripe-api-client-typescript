/**
 * Build configuration shared across all build environments.
 */
export interface IBuildConfiguration {
  httpRequestTimeoutMs: number;

  isDebug?: boolean;

  auth: {
    apiSecret: string | undefined;
    url: string | undefined;
  };

  cors: {
    allowedOrigins: string[];
  };

  payments: {
    secretKey: string | undefined;
    webhookSigningSecret: string | undefined;
  };

  port: number;
}
