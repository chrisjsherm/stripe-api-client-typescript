/**
 * Cloudflare Turnstile validation error codes.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes
 */
export enum CaptchaErrorCode {
  MissingInputSecret = "missing-input-secret",
  InvalidInputSecret = "invalid-input-secret",
  MissingInputResponse = "missing-input-response",
  InvalidInputResponse = "invalid-input-response",
  InvalidWidgetId = "invalid-widget-id",
  InvalidParsedSecret = "invalid-parsed-secret",
  BadRequest = "bad-request",
  TimeoutOrDuplicate = "timeout-or-duplicate",
  InternalError = "internal-error",
}
