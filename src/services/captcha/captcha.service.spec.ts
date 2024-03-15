import nock from "nock";
import { lastValueFrom, Observable, of } from "rxjs";
import { ParameterService } from "../parameter-store/parameter-store.service";
import { CaptchaService } from "./captcha.service";

describe("Captcha service", (): void => {
  let service: CaptchaService;

  beforeAll((): void => {
    // Swallow info logs
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  beforeEach((): void => {
    const parameterService = {
      getParameterValue: (
        _parameterName: string,
        _withDecryption = false
      ): Observable<string> => of("secret-key"),
    } as ParameterService;
    service = new CaptchaService(parameterService, "/path/to/key");
  });

  it("should create", (): void => {
    // Assert
    expect(service).toBeDefined();
  });

  it("should successfully call the verification endpoint with an IP", async (): Promise<void> => {
    // Arrange
    nock("https://challenges.cloudflare.com")
      .post("/turnstile/v0/siteverify")
      .reply(200, { success: true });

    // Act
    const result$ = service.validateToken$("my-token", "192.1.1.1");
    // Cannot use marbles: https://rxjs.dev/guide/testing/marble-testing#rxjs-code-that-consumes-promises-cannot-be-directly-tested
    const result = await lastValueFrom(result$);

    // Assert
    expect(result).toBe(true);
  });

  it("should successfully call the verification endpoint without an IP", async (): Promise<void> => {
    // Arrange
    nock("https://challenges.cloudflare.com")
      .post("/turnstile/v0/siteverify")
      .reply(200, { success: true });

    // Act
    const result$ = service.validateToken$("my-token");
    // Cannot use marbles: https://rxjs.dev/guide/testing/marble-testing#rxjs-code-that-consumes-promises-cannot-be-directly-tested
    const result = await lastValueFrom(result$);

    // Assert
    expect(result).toBe(true);
  });

  it("should unsuccessfully call the verification endpoint", async (): Promise<void> => {
    // Arrange
    nock("https://challenges.cloudflare.com")
      .post("/turnstile/v0/siteverify")
      .reply(400, { success: false });
    // Swallow error logs
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Act
    const result$ = service.validateToken$("my-token");
    // Cannot use marbles: https://rxjs.dev/guide/testing/marble-testing#rxjs-code-that-consumes-promises-cannot-be-directly-tested
    const result = await lastValueFrom(result$);

    // Assert
    expect(result).toBe(false);
  });

  it("should handle an thrown error", async (): Promise<void> => {
    // Arrange
    nock("https://challenges.cloudflare.com")
      .post("/turnstile/v0/siteverify")
      .replyWithError("Internal server error");
    // Swallow error logs
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Act
    const result$ = service.validateToken$("my-token");
    // Cannot use marbles: https://rxjs.dev/guide/testing/marble-testing#rxjs-code-that-consumes-promises-cannot-be-directly-tested
    const result = await lastValueFrom(result$);

    // Assert
    expect(result).toBe(false);
  });
});
