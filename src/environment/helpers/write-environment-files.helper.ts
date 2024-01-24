import { writeFileSync } from "fs";
import { IEnvironmentFile } from "../data-models/environment-file.interface";

/**
 * Write environment configuration files, overwriting any existing file.
 * @param environmentFiles Environment files to create
 */
export function writeEnvironmentFiles(
  ...environmentFiles: IEnvironmentFile[]
): void {
  for (const file of environmentFiles) {
    const contents = `/**
 * This generated file should not be modified. 
 * Modify configuration files in the src/environment directory.
 */
import { IBuildConfiguration } from './data-models/build-configuration.interface';
    
export const environment: IBuildConfiguration =
  ${JSON.stringify(file.buildEnvironment)}`;

    writeFileSync(file.filePath, contents);
  }
}
