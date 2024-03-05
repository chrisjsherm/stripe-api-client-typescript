import "dotenv/config";
import { IBuildConfiguration } from "./data-models/build-configuration.interface";
import { BuildTarget } from "./data-models/build-target.enum";
import { IEnvironmentFile } from "./data-models/environment-file.interface";
import { developmentConfiguration } from "./development.configuration";
import { getEnvironmentFilePath } from "./helpers/get-environment-file-path.helper";
import { writeEnvironmentFiles } from "./helpers/write-environment-files.helper";
import { productionConfiguration } from "./production.configuration";

const defaultHttpRequestTimeoutMs = 5000;
const defaultPort = 4242;

const sharedConfiguration: Pick<
  IBuildConfiguration,
  "auth" | "cors" | "httpRequestTimeoutMs" | "payments" | "port"
> = {
  auth: {
    apiSecret: process.env.AUTH_FUSION_AUTH_API_SECRET,
    group_id_facilityManagers: process.env.AUTH_GROUP_ID_FACILITY_MANAGERS,
    url: process.env.AUTH_BASE_URL,
  },
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? [],
  },
  httpRequestTimeoutMs: Number.parseInt(
    process.env.HTTP_REQUEST_TIMEOUT_MS ??
      defaultHttpRequestTimeoutMs.toString()
  ),
  payments: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSigningSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  port: Number.parseInt(process.env.PORT ?? defaultPort.toString()),
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
