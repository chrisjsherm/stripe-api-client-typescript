import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { EmailService } from "./email.service";

describe("Email service", (): void => {
  const sesMock = mockClient(SESClient);
  let service: EmailService;

  beforeEach((): void => {
    sesMock.reset();
    service = new EmailService(sesMock as unknown as SESClient);
  });

  it("should create", (): void => {
    // Assert
    expect(service).toBeDefined();
  });

  it("should send the message to the email client", async (): Promise<void> => {
    // Arrange
    sesMock.on(SendEmailCommand).resolves({
      MessageId: "123",
    });

    // Act
    const result = await service.sendMessage({
      replyToEmailAddresses: ["danno@gmail.com"],
      subject: "Hello, World",
      message: "Good morning",
      sourceEmailAddress: "contactus@example.com",
      toEmailAddresses: ["contactus@example.com"],
    });

    // Assert
    expect(result).toEqual("123");
    expect(sesMock).toHaveReceivedCommandTimes(SendEmailCommand, 1);
  });

  it("should handle an error sending the message to the email client", async (): Promise<void> => {
    // Arrange
    sesMock.on(SendEmailCommand).rejects({
      Type: "MessageRejected",
    });

    // Assert
    expect(
      async () =>
        await service.sendMessage({
          replyToEmailAddresses: ["danno@gmail.com"],
          subject: "Hello, World",
          message: "Good morning",
          sourceEmailAddress: "contactus@example.com",
          toEmailAddresses: ["contactus@example.com"],
        })
    ).rejects.toThrow();
    expect(sesMock).toHaveReceivedCommandTimes(SendEmailCommand, 1);
  });
});
