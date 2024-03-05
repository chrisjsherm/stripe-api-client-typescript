/**
 * Build configuration shared across all build environments.
 */
export interface IBuildConfiguration {
  auth: {
    apiKey: string;
    appId: string;
    group_id_facilityManagers: string;
    url: string;
  };

  cors: {
    allowedOrigins: string[];
  };

  http: {
    payloadLimit: string;
    retryDelayMs: number;
    requestTimeoutMs: number;
  };

  isDebug?: boolean;

  payments: {
    apiKey: string;
    webhookSigningKey: string;
  };

  port: number;
}
