# Variable names must be lowercase_snake_case.
variable "fusionauth_api_key" {
  description = "The API Key for Terraform to modify the FusionAuth instance"
  type        = string
  sensitive   = true
}

variable "fusionauth_host" {
  description = "Host for FusionAuth instance"
  type        = string
}

variable "tenant_email_config_default_from" {
  type = string
}

variable "tenant_email_config_default_name" {
  type = string
}

variable "tenant_email_config_host" {
  type = string
}

variable "tenant_email_config_port" {
  type = string
}

variable "jwt_config_access_token_key_id" {
  type = string
}

variable "jwt_config_id_token_key_id" {
  type = string
}
