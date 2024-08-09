import {
  to = fusionauth_tenant.Default
  id = var.AUTH_DEFAULT_TENANT_ID
}

resource "fusionauth_tenant" "Default" {
  issuer                   = var.AUTH_EXTERNAL_URL
  email_configuration {
    forgot_password_email_template_id = "0502df1e-4010-4b43-b571-d423fce978b2"
    set_password_email_template_id    = "e160cc59-a73e-4d95-8287-f82e5c541a5c"
    verification_email_template_id    = "7fa81426-42a9-4eb2-ac09-73c044d410b1"
    host                               = var.AUTH_EMAIL_HOST
    port                               = var.AUTH_EMAIL_PORT
    username                           = var.AUTH_EMAIL_USERNAME
    password                           = var.AUTH_EMAIL_PASSWORD
    verify_email                       = true
    default_from_email                 = var.AUTH_EMAIL_TEMPLATE_FROM_ADDRESS
    default_from_name                  = var.AUTH_EMAIL_TEMPLATE_FROM_NAME
  }
}