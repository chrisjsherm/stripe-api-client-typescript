import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from "@aws-sdk/client-ses";
import { IEmail } from "../../data-models/email.interface";

/**
 * Send email messages.
 */
export class EmailService {
  constructor(private sesClient: SESClient) {}

  /**
   * Send an email
   *
   * @param email Email data
   * @returns ID of the created message
   */
  async sendMessage(email: IEmail): Promise<string | undefined> {
    const emailParams: SendEmailCommandInput = {
      Source: email.sourceEmailAddress,
      ReturnPath: email.sourceEmailAddress,
      ReplyToAddresses: email.replyToEmailAddresses,
      Destination: {
        ToAddresses: email.toEmailAddresses,
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: email.message,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: email.subject,
        },
      },
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    const { MessageId } = await this.sesClient.send(sendEmailCommand);
    return MessageId;
  }
}
