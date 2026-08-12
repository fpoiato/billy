variable "aws_region" {
  type        = string
  description = "Primary AWS region"
  default     = "us-east-1"
}

variable "aws_profile" {
  type        = string
  description = "AWS CLI profile"
  default     = "nandopoiato"
}

variable "domain_name" {
  type        = string
  description = "Frontend domain"
  default     = "billy.fpoiato.com"
}

variable "hosted_zone_name" {
  type        = string
  description = "Route53 hosted zone name that contains domain_name"
  default     = "fpoiato.com"
}

variable "github_owner" {
  type        = string
  description = "GitHub org/user for the Billy repo"
  default     = "fpoiato"
}

variable "github_repo" {
  type        = string
  description = "GitHub repository name"
  default     = "billy"
}

variable "github_branch" {
  type        = string
  description = "Branch tracked by CodePipeline"
  default     = "main"
}

variable "create_github_oidc_provider" {
  type        = bool
  description = "Create the GitHub OIDC provider (set false if one already exists in the account)"
  default     = false
}
