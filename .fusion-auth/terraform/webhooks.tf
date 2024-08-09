resource "fusionauth_webhook" "app_event_handler" {
  webhook_id           = "d492c78e-9e0f-42f8-93d7-27f98f279b8f"
  connect_timeout      = 1000
  read_timeout         = 5000
  description          = "App event handler for auth events"
  url                  = var.AUTH_WEBHOOK_URL
  events_enabled       = ["user.create.complete", "user.email.verified"]
  signature_configuration {
    enabled = true
    signing_key_id = var.AUTH_ASYMMETRIC_KEY_ID
  }
}
