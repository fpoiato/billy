data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_route53_zone" "root" {
  name         = var.hosted_zone_name
  private_zone = false
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}
