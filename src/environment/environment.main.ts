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
  "AUTH_GROUP_ID__SUBSCRIPTION_STARTUP_ANNUAL_REV_0",
  "AUTH_GROUP_ID__SUBSCRIPTION_BUSINESS_ANNUAL_REV_0",
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
  | "cors"
  | "customerContact"
  | "db"
  | "http"
  | "payments"
  | "port"
> = {
  auth: {
    apiKey: process.env.AUTH_API_KEY!,
    appId: process.env.AUTH_APP_ID!,
    url: process.env.AUTH_BASE_URL!,
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
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? [],
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
