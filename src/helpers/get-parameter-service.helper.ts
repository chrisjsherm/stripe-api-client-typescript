import { ParameterService } from "../services/parameter-store/parameter-store.service";
import { getSsmClient } from "./get-ssm-client.helper";

let service: ParameterService;
const ssmClient = getSsmClient();

/**
 * Get parameter store service as a singleton.
 * @returns Parameter store service
 */
export function getParameterService(): ParameterService {
  if (!service) {
    service = new ParameterService(ssmClient);
  }

  return service;
}
