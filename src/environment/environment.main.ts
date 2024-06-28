import "dotenv/config";
import { IBuildConfiguration } from "./data-models/build-configuration.interface";
import { BuildTarget } from "./data-models/build-target.enum";
import { IEnvironmentFile } from "./data-models/environment-file.interface";
import { developmentConfiguration } from "./development.configuration";
import { getEnvironmentFilePath } from "./helpers/get-environment-file-path.helper";
import { writeEnvironmentFiles } from "./helpers/write-environment-files.helper";
import { productionConfiguration } from "./production.configuration";

const requiredEnvironmentVariables = new Set<string>([
  "AUTH_API_KEY",
  "AUTH_APP_ID",
  "AUTH_BASE_URL",
  "AUTH_GROUP_ID__ORGANIZATION_ADMINISTRATORS",
  "AUTH_GROUP_ID__SUBSCRIPTION_STARTUP_ANNUAL_REV_0",
  "AUTH_GROUP_ID__SUBSCRIPTION_BUSINESS_ANNUAL_REV_0",
  "AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_NAME",
  "AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_NAME",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "CUSTOMER_CONTACT_TO_AWS_SES_VALIDATED_EMAIL",
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
  "DB_USERNAME",
  "STRIPE_API_KEY",
  "STRIPE_WEBHOOK_SIGNING_KEY",
  "UI_ORIGIN",
]);
for (const key of requiredEnvironmentVariables) {
  if (process.env[key] === undefined || process.env[key] === "") {
    throw new Error(`Environment variable ${key} is not set`);
  }
}

const sharedConfiguration: Pick<
  IBuildConfiguration,
  | "auth"
  | "captcha"
  | "customerContact"
  | "db"
  | "http"
  | "payments"
  | "port"
  | "uiOrigin"
> = {
  auth: {
    apiKey: process.env.AUTH_API_KEY!,
    appId: process.env.AUTH_APP_ID!,
    groupId_organizationAdministrators:
      process.env.AUTH_GROUP_ID__ORGANIZATION_ADMINISTRATORS!,
    url: process.env.AUTH_BASE_URL!,
    role_btxAssistant_readWrite:
      process.env.AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_NAME!,
    role_organizationAdministrator:
      process.env.AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_NAME!,
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
    payloadLimit: process.env.HTTP_PAYLOAD_LIMIT ?? "500kb",
    requestTimeoutMs: Number.parseInt(
      process.env.HTTP_REQUEST_TIMEOUT_MS ?? "2500",
      10
    ),
    retryDelayMs: Number.parseInt(process.env.HTTP_RETRY_DELAY_MS ?? "250", 10),
  },
  payments: {
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSigningKey: process.env.STRIPE_WEBHOOK_SIGNING_KEY!,
  },
  port: Number.parseInt(process.env.SERVER_PORT ?? "4242", 10),
  uiOrigin: process.env.UI_ORIGIN ?? "",
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
