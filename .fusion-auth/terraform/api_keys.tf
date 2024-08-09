resource "fusionauth_api_key" "super_admin" {
  key         = var.AUTH_API_KEY__SUPER_ADMIN
  description = "Unrestricted API key with access to everything (for Terraform)"
}

resource "fusionauth_api_key" "app_server" {
  key         = var.AUTH_API_KEY__APP_SERVER
  description = "For the application's web API"
  permissions_endpoints {
    endpoint = "/api/group/member"
    get      = true
    delete   = true
    patch    = true
    post     = true
    put      = true
  }
}
