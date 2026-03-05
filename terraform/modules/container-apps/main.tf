resource "azurerm_container_app_environment" "main" {
  name                       = "${var.project_name}-cae-${var.environment}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = var.log_analytics_workspace_id

  tags = var.tags
}

# Frontend Container App
resource "azurerm_container_app" "frontend" {
  name                         = "${var.project_name}-frontend-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  template {
    container {
      name   = "frontend"
      image  = "${var.acr_login_server}/mediavault-frontend:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = "https://${var.project_name}-backend-${var.environment}.${azurerm_container_app_environment.main.default_domain}"
      }
    }

    min_replicas = var.environment == "prod" ? 2 : 1
    max_replicas = var.environment == "prod" ? 10 : 3
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_admin_password
  }

  tags = var.tags
}

# Backend Container App
resource "azurerm_container_app" "backend" {
  name                         = "${var.project_name}-backend-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  template {
    container {
      name   = "backend"
      image  = "${var.acr_login_server}/mediavault-backend:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "AZURE_STORAGE_ACCOUNT_NAME"
        secret_name = "storage-account-name"
      }
      env {
        name        = "AZURE_STORAGE_ACCOUNT_KEY"
        secret_name = "storage-account-key"
      }
      env {
        name        = "BETTER_AUTH_SECRET"
        secret_name = "auth-secret"
      }
      env {
        name  = "APP_URL"
        value = "https://${var.project_name}-frontend-${var.environment}.${azurerm_container_app_environment.main.default_domain}"
      }
      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }
    }

    min_replicas = var.environment == "prod" ? 2 : 1
    max_replicas = var.environment == "prod" ? 10 : 3
  }

  ingress {
    external_enabled = true
    target_port      = 8000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_admin_password
  }
  secret {
    name  = "database-url"
    value = var.database_url
  }
  secret {
    name  = "storage-account-name"
    value = var.storage_account_name
  }
  secret {
    name  = "storage-account-key"
    value = var.storage_account_key
  }
  secret {
    name  = "auth-secret"
    value = var.auth_secret
  }

  tags = var.tags
}
