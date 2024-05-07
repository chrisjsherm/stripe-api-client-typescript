/**
 * Build configuration shared across all build environments.
 */
export interface IBuildConfiguration {
  auth: {
    apiKey: string;
    appId: string;
    url: string;
  };

  captcha: {
    enabled: boolean;
    secretKeyPath: string;
  };

  cors: {
    allowedOrigins: string[];
  };

  customerContact: {
    toEmail: string;
    subjectSuffix: string;
  };

  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };

  http: {
    payloadLimit: string;
    retryDelayMs: number;
    requestTimeoutMs: number;
  };

  insertTestData: boolean;
  isDebug?: boolean;

  payments: {
    apiKey: string;
    webhookSigningKey: string;
  };

  port: number;
}
