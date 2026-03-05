terraform {
  required_version = ">= 1.9"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "mediavault-tfstate"
    storage_account_name = "mediavaulttfstatedev"
    container_name       = "tfstate"
    key                  = "dev/terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

locals {
  environment  = "dev"
  project_name = "mediavault"
  location     = var.location
  tags = {
    Environment = local.environment
    Project     = local.project_name
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "${local.project_name}-rg-${local.environment}"
  location = local.location
  tags     = local.tags
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.project_name}-law-${local.environment}"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

module "registry" {
  source              = "../../modules/registry"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

module "storage" {
  source              = "../../modules/storage"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  allowed_origins     = ["*"]
  tags                = local.tags
}

module "postgresql" {
  source              = "../../modules/postgresql"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  admin_password      = var.db_password
  tags                = local.tags
}

module "container_apps" {
  source                     = "../../modules/container-apps"
  project_name               = local.project_name
  environment                = local.environment
  location                   = local.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  acr_login_server           = module.registry.login_server
  acr_admin_username         = module.registry.admin_username
  acr_admin_password         = module.registry.admin_password
  image_tag                  = var.image_tag
  database_url               = module.postgresql.database_url
  storage_account_name       = module.storage.storage_account_name
  storage_account_key        = module.storage.storage_account_key
  auth_secret                = var.auth_secret
  tags                       = local.tags
}
