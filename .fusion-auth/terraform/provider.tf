terraform {
  required_providers {
    fusionauth = {
      source = "FusionAuth/fusionauth"
      version = "0.1.108"
    }
  }
}

provider "fusionauth" {
  api_key = var.AUTH_API_KEY__SUPER_ADMIN
  host     = var.AUTH_EXTERNAL_URL
}
