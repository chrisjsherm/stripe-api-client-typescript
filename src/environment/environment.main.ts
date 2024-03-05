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
  "AUTH_GROUP_ID_FACILITY_MANAGERS",
  "STRIPE_API_KEY",
  "STRIPE_WEBHOOK_SIGNING_KEY",
]);
for (const key of requiredEnvironmentVariables) {
  if (process.env[key] === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
}

const sharedConfiguration: Pick<
  IBuildConfiguration,
  "auth" | "cors" | "http" | "payments" | "port"
> = {
  auth: {
    apiKey: process.env.AUTH_API_KEY!,
    appId: process.env.AUTH_APP_ID!,
    group_id_facilityManagers: process.env.AUTH_GROUP_ID_FACILITY_MANAGERS!,
    url: process.env.AUTH_BASE_URL!,
  },
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? [],
  },
  http: {
    payloadLimit: process.env.HTTP_PAYLOAD_LIMIT ?? "500kb",
    requestTimeoutMs: Number.parseInt(
      process.env.HTTP_REQUEST_TIMEOUT_MS ?? "2500"
    ),
    retryDelayMs: Number.parseInt(process.env.HTTP_RETRY_DELAY_MS ?? "250"),
  },
  payments: {
    apiKey: process.env.STRIPE_API_KEY!,
    webhookSigningKey: process.env.STRIPE_WEBHOOK_SIGNING_KEY!,
  },
  port: Number.parseInt(process.env.SERVER_PORT ?? "4242"),
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
