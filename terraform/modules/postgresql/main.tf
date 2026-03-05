resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.project_name}-psql-${var.environment}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "16"
  administrator_login    = var.admin_username
  administrator_password = var.admin_password
  storage_mb             = var.environment == "prod" ? 65536 : 32768
  sku_name               = var.environment == "prod" ? "GP_Standard_D2s_v3" : "B_Standard_B1ms"
  zone                   = "1"

  backup_retention_days        = var.environment == "prod" ? 30 : 7
  geo_redundant_backup_enabled = var.environment == "prod"

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "mediavault"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
