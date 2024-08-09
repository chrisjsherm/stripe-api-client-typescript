import "dotenv/config";
import { IBuildConfiguration } from "./data-models/build-configuration.interface";
import { BuildTarget } from "./data-models/build-target.enum";
import { IEnvironmentFile } from "./data-models/environment-file.interface";
import { developmentConfiguration } from "./development.configuration";
import { getEnvironmentFilePath } from "./helpers/get-environment-file-path.helper";
import { throwIfEnvNotSet } from "./helpers/throw-if-env-not-set.helper";
import { writeEnvironmentFiles } from "./helpers/write-environment-files.helper";
import { productionConfiguration } from "./production.configuration";

throwIfEnvNotSet(
  "TF_VAR_AUTH_ADMIN_EMAIL",
  "TF_VAR_AUTH_ADMIN_PASSWORD",
  "TF_VAR_AUTH_API_KEY__APP_SERVER",
  "TF_VAR_AUTH_API_KEY__SUPER_ADMIN",
  "TF_VAR_AUTH_APPLICATION_ID",
  "TF_VAR_AUTH_APPLICATION_NAME",
  "TF_VAR_AUTH_ASYMMETRIC_KEY_ID",
  "TF_VAR_AUTH_CLIENT_SECRET",
  "TF_VAR_AUTH_CONTAINER_URL",
  "AUTH_DATABASE_PASSWORD",
  "AUTH_DATABASE_USERNAME",
  "TF_VAR_AUTH_DEFAULT_TENANT_ID",
  "TF_VAR_AUTH_EMAIL_HOST",
  "TF_VAR_AUTH_EMAIL_PORT",
  "TF_VAR_AUTH_EMAIL_TEMPLATE_FROM_ADDRESS",
  "TF_VAR_AUTH_EMAIL_TEMPLATE_FROM_NAME",
  "TF_VAR_AUTH_EXTERNAL_URL",
  "AUTH_FUSIONAUTH_APP_KICKSTART_FILE",
  "AUTH_FUSIONAUTH_APP_MEMORY",
  "AUTH_FUSIONAUTH_APP_RUNTIME_MODE",
  "TF_VAR_AUTH_GROUP__ORGANIZATION_ADMINISTRATORS_ID",
  "TF_VAR_AUTH_GROUP__SUBSCRIPTION_BUSINESS_ANNUAL_ID",
  "TF_VAR_AUTH_GROUP__SUBSCRIPTION_STARTUP_ANNUAL_ID",
  "TF_VAR_AUTH_GROUP_ID__ORGANIZATION_ADMINISTRATORS",
  "TF_VAR_AUTH_GROUP_ID__SUBSCRIPTION_BUSINESS_ANNUAL_REV_0",
  "TF_VAR_AUTH_GROUP_ID__SUBSCRIPTION_STARTUP_ANNUAL_REV_0",
  "TF_VAR_AUTH_LOGOUT_URL",
  "TF_VAR_AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_ID",
  "TF_VAR_AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_NAME",
  "TF_VAR_AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_ID",
  "TF_VAR_AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_NAME",
  "TF_VAR_AUTH_WEBHOOK_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_REGION",
  "AWS_SECRET_ACCESS_KEY",
  "CAPTCHA_ENABLED",
  "CAPTCHA_SECRET_KEY_AWS_SSM_PARAMETER_PATH",
  "CUSTOMER_CONTACT_SUBJECT_SUFFIX",
  "CUSTOMER_CONTACT_TO_AWS_SES_VALIDATED_EMAIL",
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
  "DB_USERNAME",
  "OPENSEARCH_INITIAL_ADMIN_PASSWORD",
  "OPENSEARCH_JAVA_OPTS",
  "PG_ADMIN_DEFAULT_USER_EMAIL",
  "PG_ADMIN_DEFAULT_USER_PASSWORD",
  "PG_ADMIN_PORT",
  "STRIPE_API_KEY",
  "STRIPE_WEBHOOK_SIGNING_KEY",
  "TF_VAR_UI_ORIGIN",
  "WEB_API_PAYLOAD_LIMIT",
  "WEB_API_REQUEST_TIMEOUT_MS",
  "WEB_API_RETRY_DELAY_MS",
  "WEB_API_SERVER_PORT",
  "WEB_API_UPSERT_SEED_DATA"
);

const sharedConfiguration: Pick<
  IBuildConfiguration,
  | "auth"
  | "aws"
  | "captcha"
  | "customerContact"
  | "db"
  | "http"
  | "payments"
  | "port"
  | "uiOrigin"
> = {
  auth: {
    apiKey: process.env.TF_VAR_AUTH_API_KEY__APP_SERVER!,
    appId: process.env.TF_VAR_AUTH_APPLICATION_ID!,
    containerUrl: process.env.TF_VAR_AUTH_CONTAINER_URL!,
    groupId_organizationAdministrators:
      process.env.TF_VAR_AUTH_GROUP_ID__ORGANIZATION_ADMINISTRATORS!,
    groupId_subscriptionBusinessAnnual:
      process.env.TF_VAR_AUTH_GROUP__SUBSCRIPTION_BUSINESS_ANNUAL_ID!,
    groupId_subscriptionStartupAnnual:
      process.env.TF_VAR_AUTH_GROUP__SUBSCRIPTION_STARTUP_ANNUAL_ID!,
    externalUrl: process.env.TF_VAR_AUTH_EXTERNAL_URL!,
    role_btxAssistant_readWrite:
      process.env.TF_VAR_AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_NAME!,
    role_organizationAdministrator:
      process.env.TF_VAR_AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_NAME!,
  },
  aws: {
    region: process.env.AWS_REGION!,
  },
  captcha: {
    enabled: process.env.CAPTCHA_ENABLED === "true",
    secretKeyPath: (function getPath(
      isCaptchaEnabled: boolean,
      secretKeyPath: string | undefined
    ): string {
      if (isCaptchaEnabled && secretKeyPath === undefined) {
        throw new Error(
          "Captcha is enabled and environment variable " +
            "CAPTCHA_SECRET_KEY_AWS_SSM_PARAMETER_PATH is not set."
        );
      }

      return secretKeyPath ?? "";
    })(
      !!process.env.CAPTCHA_ENABLED,
      process.env.CAPTCHA_SECRET_KEY_AWS_SSM_PARAMETER_PATH
    ),
  },
  customerContact: {
    subjectSuffix: process.env.CUSTOMER_CONTACT_SUBJECT_SUFFIX ?? "",
    toEmail: process.env.CUSTOMER_CONTACT_TO_AWS_SES_VALIDATED_EMAIL!,
  },
  db: {
    host: process.env.DB_HOST!,
    name: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: Number.parseInt(process.env.DB_PORT ?? "5432", 10),
    username: process.env.DB_USERNAME!,
  },
  http: {
    payloadLimit: process.env.WEB_API_PAYLOAD_LIMIT ?? "500kb",
    requestTimeoutMs: Number.parseInt(
      process.env.WEB_API_REQUEST_TIMEOUT_MS ?? "2500",
      10
    ),
    retryDelayMs: Number.parseInt(
      process.env.WEB_API_RETRY_DELAY_MS ?? "250",
      10
    ),
  },
  payments: {
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSigningKey: process.env.STRIPE_WEBHOOK_SIGNING_KEY!,
  },
  port: Number.parseInt(process.env.WEB_API_SERVER_PORT ?? "4242", 10),
  uiOrigin: process.env.TF_VAR_UI_ORIGIN ?? "",
};

// Write the environment files when Node runs this file.
(function main(...environmentFiles: IEnvironmentFile[]): void {
  writeEnvironmentFiles(...environmentFiles);
})(
  {
    filePath: getEnvironmentFilePath(BuildTarget.Development),
    buildEnvironment: {
      ...sharedConfiguration,
      ...developmentConfiguration,
    },
  },
  {
    filePath: getEnvironmentFilePath(BuildTarget.Production),
    buildEnvironment: {
      ...sharedConfiguration,
      ...productionConfiguration,
    },
  }
);
