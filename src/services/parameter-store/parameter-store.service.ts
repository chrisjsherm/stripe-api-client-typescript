import {
  GetParameterCommand,
  GetParameterCommandInput,
  GetParameterCommandOutput,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { Observable, from, map } from "rxjs";

/**
 * Retrieve parameters from a remote AWS SSM parameter store.
 */
export class ParameterService {
  constructor(private ssmClient: SSMClient) {}

  /**
   * Get a parameter from the store.
   *
   * @param parameterName Parameter to retrieve
   * @param withDecryption Whether we should decrypt the parameter value
   * @returns Parameter value
   * @throws Error when the parameter is not found
   */
  getParameterValue(
    parameterName: string,
    withDecryption = false
  ): Observable<string> {
    const input: GetParameterCommandInput = {
      Name: parameterName,
      WithDecryption: withDecryption,
    };
    const command = new GetParameterCommand(input);

    return from(this.ssmClient.send(command)).pipe(
      map((result: GetParameterCommandOutput): string => {
        if (result.Parameter === undefined || !result.Parameter.Value) {
          throw new Error(
            `Parameter "${parameterName}" does not have a value.`
          );
        }

        return result.Parameter.Value;
      })
    );
  }
}
