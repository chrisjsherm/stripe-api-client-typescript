variable "UI_ORIGIN" {
  type        = string
  description = "Allowed CORS origin"
}

variable "AUTH_API_KEY__APP_SERVER" {
  type        = string
  description = "API key for the web API"
  sensitive   = true
}

variable "AUTH_API_KEY__SUPER_ADMIN" {
  type        = string
  description = "Unrestricted API key with access to everything for Terraform and kickstart.json"
  sensitive   = true
}

variable "AUTH_APPLICATION_ID" {
  type        = string
  description = "Application ID"
}

variable "AUTH_APPLICATION_NAME" {
  type        = string
  description = "Application name"
}

variable "AUTH_ASYMMETRIC_KEY_ID" {
  type        = string
  description = "Asymmetric key ID"
  sensitive   = true
}

variable "AUTH_CLIENT_SECRET" {
  type        = string
}

variable "AUTH_DEFAULT_TENANT_ID" {
  type        = string
  description = "Default tenant ID"
}

variable "AUTH_EMAIL_HOST" {
  type        = string
  description = "Email host"
}

variable "AUTH_EMAIL_PASSWORD" {
  type        = string
  description = "Email password"
  sensitive   = true
}

variable "AUTH_EMAIL_PORT" {
  type        = string
  description = "Email port"
}

variable "AUTH_EMAIL_TEMPLATE_FROM_ADDRESS" {
  type        = string
  description = "From email address for email templates"
}

variable "AUTH_EMAIL_TEMPLATE_FROM_NAME" {
  type        = string
  description = "From name for email templates"
}

variable "AUTH_EMAIL_USERNAME" {
  type        = string
  description = "Email username"
}

variable "AUTH_EXTERNAL_URL" {
  type        = string
  description = "URL for the FusionAuth server"
}

variable "AUTH_GROUP__ORGANIZATION_ADMINISTRATORS_ID" {
  type        = string
  description = "Group ID for Organization Administrators"
}

variable "AUTH_GROUP__SUBSCRIPTION_BUSINESS_ANNUAL_ID" {
  type        = string
  description = "Group ID for Subscription: Business Annual"
}

variable "AUTH_GROUP__SUBSCRIPTION_STARTUP_ANNUAL_ID" {
  type        = string
  description = "Group ID for Subscription: Startup Annual"
}

variable "AUTH_LOGOUT_URL" {
  type        = string
  description = "URL to redirect to on logout"
}

variable "AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_ID" {
  type        = string
  description = "Role ID for read and write permission to the BTX Assistant service"
}

variable "AUTH_ROLE__BTX_ASSISTANT_READ_WRITE_NAME" {
  type        = string
  description = "Role name for read and write permission to the BTX Assistant service"
}

variable "AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_ID" {
  type        = string
  description = "Role ID for managing the organization associated with a user account"
}

variable "AUTH_ROLE__ORGANIZATION_ADMINISTRATOR_NAME" {
  type        = string
  description = "Role name for managing the organization associated with a user account"
}

variable "AUTH_WEBHOOK_URL" {
  type        = string
  description = "Webhook URL for application event handling"
}
