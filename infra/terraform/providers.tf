provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project   = "billy"
      ManagedBy = "terraform"
    }
  }
}

# ACM for CloudFront must be in us-east-1
provider "aws" {
  alias   = "us_east_1"
  region  = "us-east-1"
  profile = var.aws_profile

  default_tags {
    tags = {
      Project   = "billy"
      ManagedBy = "terraform"
    }
  }
}
