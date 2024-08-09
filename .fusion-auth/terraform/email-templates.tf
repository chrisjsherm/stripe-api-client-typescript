resource "fusionauth_email_template" "forgot_password" {
  template_id          = "0502df1e-4010-4b43-b571-d423fce978b2"
  default_from_name    = var.AUTH_EMAIL_TEMPLATE_FROM_NAME
  default_subject      = "Reset your password"
  default_html_template = file("email_templates/forgot-password.html.ftl")
  default_text_template = file("email_templates/forgot-password.txt.ftl")
  from_email           = var.AUTH_EMAIL_TEMPLATE_FROM_ADDRESS
  name                 = "Forgot Password"
}

resource "fusionauth_email_template" "setup_password" {
  template_id          = "e160cc59-a73e-4d95-8287-f82e5c541a5c"
  default_from_name    = var.AUTH_EMAIL_TEMPLATE_FROM_NAME
  default_subject      = "Setup your password"
  default_html_template = file("email_templates/setup-password.html.ftl")
  default_text_template = file("email_templates/setup-password.txt.ftl")
  from_email           = var.AUTH_EMAIL_TEMPLATE_FROM_ADDRESS
  name                 = "Setup Password"
}

resource "fusionauth_email_template" "email_verification" {
  template_id          = "7fa81426-42a9-4eb2-ac09-73c044d410b1"
  default_from_name    = var.AUTH_EMAIL_TEMPLATE_FROM_NAME
  default_subject      = "Verify your email address"
  default_html_template = file("email_templates/email-verification.html.ftl")
  default_text_template = file("email_templates/email-verification.txt.ftl")
  from_email           = var.AUTH_EMAIL_TEMPLATE_FROM_ADDRESS
  name                 = "Email Verification"
}
