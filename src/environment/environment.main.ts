import "dotenv/config";
import { BuildTarget } from "./data-models/build-target.enum";
import { IEnvironmentFile } from "./data-models/environment-file.interface";
import { developmentConfiguration } from "./development.configuration";
import { getEnvironmentFilePath } from "./helpers/get-environment-file-path.helper";
import { writeEnvironmentFiles } from "./helpers/write-environment-files.helper";
import { productionConfiguration } from "./production.configuration";

const defaultHttpRequestTimeoutMs = 5000;
const defaultPort = 4242;

// Write the environment files when Node runs this file.
(function main(...environmentFiles: IEnvironmentFile[]): void {
  writeEnvironmentFiles(...environmentFiles);
})(
  {
    filePath: getEnvironmentFilePath(BuildTarget.Development),
    buildEnvironment: {
      httpRequestTimeoutMs: Number.parseInt(
        process.env.HTTP_REQUEST_TIMEOUT_MS ??
          defaultHttpRequestTimeoutMs.toString()
      ),
      port: Number.parseInt(process.env.PORT ?? defaultPort.toString()),
      ...developmentConfiguration,
    },
  },
  {
    filePath: getEnvironmentFilePath(BuildTarget.Production),
    buildEnvironment: {
      httpRequestTimeoutMs: Number.parseInt(
        process.env.HTTP_REQUEST_TIMEOUT_MS ??
          defaultHttpRequestTimeoutMs.toString()
      ),
      port: Number.parseInt(process.env.PORT ?? defaultPort.toString()),
      ...productionConfiguration,
      isDebug: false,
    },
  }
);
