terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.82"
    }
  }

  backend "s3" {
    bucket  = "billy-terraform-state-986873053420"
    key     = "billy/terraform.tfstate"
    region  = "us-east-1"
    profile = "nandopoiato"
  }
}
