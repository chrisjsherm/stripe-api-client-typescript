/**
 * Build configuration shared across all build environments.
 */
export interface IBuildConfiguration {
  auth: {
    apiKey: string;
    appId: string;
    groupId_organizationAdministrators: string;
    url: string;
    role_btxAssistant_readWrite: string;
    role_organizationAdministrator: string;
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
