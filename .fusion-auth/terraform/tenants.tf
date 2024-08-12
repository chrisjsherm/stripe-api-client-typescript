import {
  to = fusionauth_tenant.Default
  id = "8a97a4fc-5097-3623-0e58-9a460da262fe"
}

resource "fusionauth_tenant" "Default" {
  lifecycle {
    prevent_destroy = true
  }
  name     = "Default"
  issuer   = var.fusionauth_host
  theme_id = "75a068fd-e94b-451a-9aeb-3ddb9a3b5987"
  external_identifier_configuration {
    authorization_grant_id_time_to_live_in_seconds = 30
    change_password_id_generator {
      length = 32
      type   = "randomBytes"
    }
    change_password_id_time_to_live_in_seconds = 600
    device_code_time_to_live_in_seconds        = 300
    device_user_code_id_generator {
      length = 6
      type   = "randomAlphaNumeric"
    }
    email_verification_id_generator {
      length = 32
      type   = "randomBytes"
    }
    email_verification_id_time_to_live_in_seconds = 86400
    email_verification_one_time_code_generator {
      length = 6
      type   = "randomAlphaNumeric"
    }
    external_authentication_id_time_to_live_in_seconds = 300
    one_time_password_time_to_live_in_seconds          = 60
    passwordless_login_generator {
      length = 32
      type   = "randomBytes"
    }
    passwordless_login_time_to_live_in_seconds = 180
    registration_verification_id_generator {
      length = 32
      type   = "randomBytes"
    }
    registration_verification_id_time_to_live_in_seconds = 86400
    registration_verification_one_time_code_generator {
      length = 6
      type   = "randomAlphaNumeric"
    }
    saml_v2_authn_request_id_ttl_seconds = 300
    setup_password_id_generator {
      length = 32
      type   = "randomBytes"
    }
    setup_password_id_time_to_live_in_seconds = 86400
    two_factor_id_time_to_live_in_seconds     = 300
    two_factor_one_time_code_id_generator {
      length = 6
      type   = "randomDigits"
    }
    two_factor_trust_id_time_to_live_in_seconds         = 2592000
    two_factor_one_time_code_id_time_to_live_in_seconds = 60
  }
  jwt_configuration {
    refresh_token_time_to_live_in_minutes                        = 43200
    time_to_live_in_seconds                                      = 3600
    refresh_token_sliding_window_maximum_time_to_live_in_minutes = 43200
    refresh_token_revocation_policy_on_login_prevented           = true
    refresh_token_revocation_policy_on_password_change           = true
    access_token_key_id                                          = var.jwt_config_access_token_key_id
    id_token_key_id                                              = var.jwt_config_id_token_key_id
  }
  login_configuration {
    require_authentication = true
  }
  email_configuration {
    default_from_email                  = var.tenant_email_config_default_from
    default_from_name                   = var.tenant_email_config_default_name
    host                                = var.tenant_email_config_host
    implicit_email_verification_allowed = true
    port                                = var.tenant_email_config_port
    verification_strategy               = "ClickableLink"
    verify_email                        = true
    verify_email_when_changed           = true
    forgot_password_email_template_id   = "0502df1e-4010-4b43-b571-d423fce978b2"
    set_password_email_template_id      = "e160cc59-a73e-4d95-8287-f82e5c541a5c"
    verification_email_template_id      = "7fa81426-42a9-4eb2-ac09-73c044d410b1"
    security                            = "NONE"
  }
  event_configuration {
    enabled          = true
    event            = "user.create.complete"
    transaction_type = "None"
  }
  event_configuration {
    enabled          = true
    event            = "user.email.verified"
    transaction_type = "None"
  }
}
