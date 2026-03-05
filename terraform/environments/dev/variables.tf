variable "subscription_id" {
  type        = string
  description = "Azure Subscription ID"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "japaneast"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL admin password"
  sensitive   = true
}

variable "auth_secret" {
  type        = string
  description = "Better Auth secret key (min 32 chars)"
  sensitive   = true
}

variable "image_tag" {
  type        = string
  description = "Docker image tag to deploy"
  default     = "latest"
}
