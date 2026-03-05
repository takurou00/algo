resource "azurerm_storage_account" "main" {
  name                     = "${replace(var.project_name, "-", "")}${var.environment}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "ZRS" : "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD", "OPTIONS"]
      allowed_origins    = var.allowed_origins
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }

    delete_retention_policy {
      days = var.environment == "prod" ? 30 : 7
    }
  }

  tags = var.tags
}

resource "azurerm_storage_container" "mediavault" {
  name                  = "mediavault"
  storage_account_id    = azurerm_storage_account.main.id
  container_access_type = "private"
}
