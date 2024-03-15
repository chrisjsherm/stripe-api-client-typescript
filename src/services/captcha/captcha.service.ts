import { ClientRequest } from "http";
import { request } from "https";
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  ReplaySubject,
  take,
  tap,
} from "rxjs";
import { getEnvironmentConfiguration } from "../../helpers/get-environment-configuration.helper";
import { ParameterService } from "../parameter-store/parameter-store.service";

const { captcha: captchaConfig } = getEnvironmentConfiguration();
/**
 * Validate a human has initiated a request by validating the supplied token
 */
export class CaptchaService {
  private readonly secretKey: ReplaySubject<string>;

  constructor(
    parameterService: ParameterService,
    secretKeyParameterPath: string
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
   *
   * @param token Token to validate
   * @param ip IP address of the request
   * @returns Fetch API Response
   */
  validateToken(token: string, ip?: string): Observable<boolean> {
    if (captchaConfig.enabled === false) {
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
          new Promise<{ success: boolean }>((resolve, reject) => {
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
          })
        );
      }),
      map((response): boolean => {
        return response.success;
      }),
      take(1),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }
}
