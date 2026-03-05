output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "storage_account_key" {
  value     = azurerm_storage_account.main.primary_access_key
  sensitive = true
}

output "storage_account_id" {
  value = azurerm_storage_account.main.id
}
