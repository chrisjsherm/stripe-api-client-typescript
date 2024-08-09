resource "fusionauth_group" "organization_administrators" {
  group_id = var.AUTH_GROUP__ORGANIZATION_ADMINISTRATORS_ID
  name     = "Organization Administrators"
  role_ids = [var.AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_ID]
}

resource "fusionauth_group" "subscription_startup_annual" {
  group_id = var.AUTH_GROUP__SUBSCRIPTION_STARTUP_ANNUAL_ID
  name     = "Subscription: Startup Annual"
  role_ids = [var.AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_ID]
}

resource "fusionauth_group" "subscription_business_annual" {
  group_id = var.AUTH_GROUP__SUBSCRIPTION_BUSINESS_ANNUAL_ID
  name     = "Subscription: Business Annual"
  role_ids = [var.AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_ID]
}
