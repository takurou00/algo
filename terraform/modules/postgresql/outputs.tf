output "server_fqdn" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_url" {
  value     = "postgresql://${var.admin_username}:${var.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/mediavault?sslmode=require"
  sensitive = true
}
