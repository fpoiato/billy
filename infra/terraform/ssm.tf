resource "aws_ssm_parameter" "frontend_bucket" {
  name        = "/billy/frontend/bucket"
  type        = "String"
  value       = aws_s3_bucket.frontend.bucket
  description = "S3 bucket for Billy SPA artifacts"
}

resource "aws_ssm_parameter" "cloudfront_distribution_id" {
  name        = "/billy/frontend/cloudfront_distribution_id"
  type        = "String"
  value       = aws_cloudfront_distribution.frontend.id
  description = "CloudFront distribution id for Billy SPA"
}

resource "aws_ssm_parameter" "frontend_domain" {
  name        = "/billy/frontend/domain"
  type        = "String"
  value       = var.domain_name
  description = "Public domain for Billy SPA"
}

resource "aws_ssm_parameter" "pipeline_name" {
  name        = "/billy/pipeline/name"
  type        = "String"
  value       = aws_codepipeline.billy.name
  description = "CodePipeline name for Billy deploy"
}

resource "aws_ssm_parameter" "pipeline_source_bucket" {
  name        = "/billy/pipeline/source_bucket"
  type        = "String"
  value       = aws_s3_bucket.pipeline_source.bucket
  description = "S3 bucket that holds the pipeline source zip"
}

resource "aws_ssm_parameter" "pipeline_source_key" {
  name        = "/billy/pipeline/source_key"
  type        = "String"
  value       = local.source_object_key
  description = "S3 object key for the pipeline source zip"
}
