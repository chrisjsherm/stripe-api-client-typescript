/**
 * Build configuration shared across all build environments.
 */
export interface IBuildConfiguration {
  auth: {
    apiKey: string;
    appId: string;
    containerUrl: string;
    externalUrl: string;
    groupId_organizationAdministrators: string;
    groupId_subscriptionBusinessAnnual: string;
    groupId_subscriptionStartupAnnual: string;
    role_btxAssistant_readWrite: string;
    role_organizationAdministrator: string;
  };

  aws: {
    region: string;
  };

  captcha: {
    enabled: boolean;
    secretKeyPath: string;
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

  upsertSeedData: boolean;
  isDebug?: boolean;

  payments: {
    apiKey: string;
    webhookSigningKey: string;
  };

  port: number;

  uiOrigin: string;
}
