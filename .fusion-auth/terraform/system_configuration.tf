resource "fusionauth_system_configuration" "medspaah_system_config" {
  cors_configuration {
    allow_credentials     = true
    allowed_methods       = ["GET", "POST", "OPTIONS"]
    allowed_origins       = [var.UI_ORIGIN]
    enabled               = true
    preflight_max_age_in_seconds = 0
  }
}
