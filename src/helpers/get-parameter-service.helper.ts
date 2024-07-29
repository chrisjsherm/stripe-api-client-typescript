import { ParameterService } from "../services/parameter-store/parameter-store.service";
import { getSsmClient } from "./get-ssm-client.helper";

let service: ParameterService;

/**
 * Get parameter store service as a singleton.
 * @param awsRegion Region in which the SSM service operates
 * @returns Parameter store service
 */
export function getParameterService(awsRegion: string): ParameterService {
  if (!service) {
    service = new ParameterService(getSsmClient(awsRegion));
  }

  return service;
}
