import { ClientRequest } from "http";
import createHttpError from "http-errors";
import { request } from "https";
import {
  from,
  map,
  mergeMap,
  Observable,
  of,
  ReplaySubject,
  take,
  tap,
} from "rxjs";
import { ParameterService } from "../parameter-store/parameter-store.service";
import { CaptchaErrorCode } from "./captcha-error-code.enum";

/**
 * Validate a human has initiated a request by validating the supplied token
 */
export class CaptchaService {
  private readonly secretKey: ReplaySubject<string>;

  constructor(
    parameterService: ParameterService,
    secretKeyParameterPath: string,
    private isCaptchaEnabled = true
  ) {
    this.secretKey = new ReplaySubject(1);
    parameterService
      .getParameterValue(secretKeyParameterPath, true)
      .pipe(
        tap((value: string): void => {
          this.secretKey.next(value);
        }),
        take(1)
      )
      .subscribe();
  }

  /**
   * Validate a token against the captcha API
   * @param token Token to validate
   * @param ip IP address of the request
   * @returns Whether the captcha token is valid
   */
  validateToken$(token: string, ip?: string): Observable<boolean> {
    if (this.isCaptchaEnabled === false) {
      console.info(`Captcha is disabled. Considering token valid.`);
      return of(true);
    }

    return this.secretKey.pipe(
      map((key: string) => {
        let xFormBody = `${encodeURI("secret")}=${encodeURI(key)}&${encodeURI(
          "response"
        )}=${encodeURI(token)}`;

        if (ip) {
          xFormBody += `&${encodeURI("remoteip")}=${encodeURI(ip)}`;
        }

        return xFormBody;
      }),
      mergeMap((xFormBody: string) => {
        return from(
          new Promise<{ success: boolean; "error-codes": string[] }>(
            (resolve, reject) => {
              const req: ClientRequest = request(
                {
                  hostname: "challenges.cloudflare.com",
                  port: 443,
                  path: "/turnstile/v0/siteverify",
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(xFormBody),
                  },
                },
                function (res) {
                  res.setEncoding("utf8");

                  let responseBody = "";

                  // Build JSON string from response chunks.
                  res.on(
                    "data",
                    (chunk) => (responseBody = responseBody + chunk)
                  );
                  res.on("end", function () {
                    const parsedBody = JSON.parse(responseBody + "");

                    // Resolve or reject based on status code.
                    res.statusCode !== 200
                      ? reject(parsedBody)
                      : resolve(parsedBody);
                  });
                }
              );

              req.write(xFormBody);
              req.end();
              req.on("error", function (err) {
                reject(err);
              });
            }
          )
        );
      }),
      map((response): boolean => {
        if (response.success) {
          return true;
        }

        if (response["error-codes"].length === 0) {
          return false;
        }

        switch (response["error-codes"][0] as CaptchaErrorCode) {
          case CaptchaErrorCode.BadRequest:
            throw createHttpError.BadRequest(
              "Captcha validation request was malformed."
            );

          case CaptchaErrorCode.InternalError:
            throw createHttpError.InternalServerError(
              "Error validating captcha."
            );

          case CaptchaErrorCode.InvalidInputResponse:
            throw createHttpError.BadRequest(
              "Captcha token is invalid or expired."
            );

          case CaptchaErrorCode.InvalidInputSecret:
            throw createHttpError.InternalServerError(
              "Captcha validation secret is missing."
            );

          case CaptchaErrorCode.InvalidParsedSecret:
            throw createHttpError.InternalServerError(
              "Captcha validation secret is invalid."
            );

          case CaptchaErrorCode.InvalidWidgetId:
            throw createHttpError.BadRequest(
              "Captcha widget ID does not match."
            );

          case CaptchaErrorCode.MissingInputResponse:
            throw createHttpError.BadRequest("Captcha token is missing.");

          case CaptchaErrorCode.MissingInputSecret:
            throw createHttpError.BadRequest("Captcha secret is missing.");

          case CaptchaErrorCode.TimeoutOrDuplicate:
            throw createHttpError.BadRequest(
              "Captcha token has already been validated or the request timed out."
            );

          default:
            throw new Error("Unknown error occurred validating the captcha.");
        }
      }),
      take(1)
    );
  }
}
