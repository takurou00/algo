output "frontend_url" {
  value = module.container_apps.frontend_url
}

output "backend_url" {
  value = module.container_apps.backend_url
}

output "acr_login_server" {
  value = module.registry.login_server
}
