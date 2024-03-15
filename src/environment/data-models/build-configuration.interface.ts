/**
 * Build configuration shared across all build environments.
 */
export interface IBuildConfiguration {
  auth: {
    apiKey: string;
    appId: string;
    groupId_subscriptionBasicAnnual: string;
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
