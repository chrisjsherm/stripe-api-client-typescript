import { CaptchaService } from "../services/captcha/captcha.service";
import { getEnvironmentConfiguration } from "./get-environment-configuration.helper";
import { getParameterService } from "./get-parameter-service.helper";

let service: CaptchaService;
const parameterService = getParameterService();
const { captcha } = getEnvironmentConfiguration();

/**
 * Get the captcha service as a singleton.
 * @returns Captcha service
 */
export function getCaptchaService(): CaptchaService {
  if (!service) {
    service = new CaptchaService(parameterService, captcha.secretKeyPath);
  }

  return service;
}
