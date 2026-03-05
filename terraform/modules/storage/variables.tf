variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "allowed_origins" {
  type    = list(string)
  default = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
