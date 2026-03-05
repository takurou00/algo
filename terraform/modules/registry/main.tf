resource "azurerm_container_registry" "main" {
  name                = "${replace(var.project_name, "-", "")}acr"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.environment == "prod" ? "Premium" : "Basic"
  admin_enabled       = true

  tags = var.tags
}
