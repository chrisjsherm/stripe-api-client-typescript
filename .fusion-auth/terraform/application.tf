resource "fusionauth_application" "medspaah" {
  id             = var.AUTH_APPLICATION_ID
  name           = var.AUTH_APPLICATION_NAME
  tenant_id      = var.AUTH_DEFAULT_TENANT_ID
  jwt_configuration {
    enabled              = true
    access_token_id  = var.AUTH_ASYMMETRIC_KEY_ID
    id_token_key_id      = var.AUTH_ASYMMETRIC_KEY_ID
  }
  oauth_configuration {
    authorized_redirect_urls = [var.UI_ORIGIN]
    client_secret            = var.AUTH_CLIENT_SECRET
    AUTH_LOGOUT_URL               = var.AUTH_LOGOUT_URL
    enabled_grants           = ["authorization_code", "refresh_token"]
    generate_refresh_tokens  = true
    scope_handling_policy    = "Strict"
    unknown_scope_policy     = "Reject"
  }
  roles = [
    {
      description = "Read and write permission to the BTX Assistant service"
      id          = var.AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_ID
      name        = var.AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_NAME
    },
    {
      description = "Manage the organization associated with your user account"
      id          = var.AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_ID
      name        = var.AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_NAME
    }
  ]
}
