/**
 * Email message
 */
export interface IEmail {
  message: string;
  replyToEmailAddresses: string[];
  sourceEmailAddress: string;
  subject: string;
  toEmailAddresses: string[];

  ccEmailAddresses?: string[];
  bccEmailAddresses?: string[];
}
