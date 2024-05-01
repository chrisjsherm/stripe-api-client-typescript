import { Request, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { lastValueFrom, take } from "rxjs";
import htmlSanitize from "sanitize-html";
import { ContactForm } from "../data-models/interfaces/contact-form.interface";
import { getCaptchaService } from "../helpers/get-captcha-service.helper";
import { getEmailService } from "../helpers/get-email-service.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

const captchaService = getCaptchaService();
const emailService = getEmailService();
const config = getEnvironmentConfiguration();

/**
 * Handle a customer contacting the business.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function createCustomerContact(
  req: Request,
  res: Response
): Promise<void> {
  const contactForm: ContactForm = req.body;

  try {
    const validatedToken$ = captchaService
      .validateToken$(contactForm.captchaToken ?? "", req.ip)
      .pipe(take(1));

    if ((await lastValueFrom(validatedToken$)) === false) {
      throw createHttpError.Unauthorized("Captcha validation failed.");
    }

    const subject =
      `Message from ${contactForm.fromName}: ${contactForm.subject} ` +
      config.customerContact.subjectSuffix;
    const messageId = await emailService.sendMessage$({
      // Address we use SES to send from must be validated, so it has to be ours.
      sourceEmailAddress: config.customerContact.toEmail,
      replyToEmailAddresses: [contactForm.fromEmailAddress],
      toEmailAddresses: [config.customerContact.toEmail],
      subject: htmlSanitize(subject),
      message: htmlSanitize(contactForm.message),
    });

    res.send({
      data: {
        id: messageId,
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "Error processing customer contact.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
