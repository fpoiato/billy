output "frontend_bucket" {
  description = "S3 bucket hosting the Billy SPA"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution id"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "Public HTTPS URL for the SPA"
  value       = "https://${var.domain_name}"
}

output "codepipeline_name" {
  description = "Deploy pipeline name"
  value       = aws_codepipeline.billy.name
}

output "codebuild_project_name" {
  description = "CodeBuild project name"
  value       = aws_codebuild_project.billy.name
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC (pipeline trigger only)"
  value       = aws_iam_role.github_actions.arn
}

output "pipeline_source_s3_uri" {
  description = "S3 URI for the source zip"
  value       = "s3://${aws_s3_bucket.pipeline_source.bucket}/${local.source_object_key}"
}
