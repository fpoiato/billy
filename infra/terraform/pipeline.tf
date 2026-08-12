locals {
  pipeline_name     = "billy-deploy"
  codebuild_name    = "billy-build"
  github_full_repo  = "${var.github_owner}/${var.github_repo}"
  source_object_key = "billy-source.zip"
}

resource "aws_iam_role" "codepipeline" {
  name = "billy-codepipeline"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "codepipeline.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "codepipeline" {
  name = "billy-codepipeline"
  role = aws_iam_role.codepipeline.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ArtifactsAndSource"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectTagging",
          "s3:GetObjectVersionTagging",
          "s3:GetBucketVersioning",
          "s3:GetBucketLocation",
          "s3:ListBucket",
          "s3:ListBucketVersions",
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:PutObjectTagging",
        ]
        Resource = [
          aws_s3_bucket.pipeline_artifacts.arn,
          "${aws_s3_bucket.pipeline_artifacts.arn}/*",
          aws_s3_bucket.pipeline_source.arn,
          "${aws_s3_bucket.pipeline_source.arn}/*",
        ]
      },
      {
        Sid    = "StartBuild"
        Effect = "Allow"
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild",
        ]
        Resource = aws_codebuild_project.billy.arn
      },
    ]
  })
}

resource "aws_iam_role" "codebuild" {
  name = "billy-codebuild"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "codebuild" {
  name = "billy-codebuild"
  role = aws_iam_role.codebuild.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Logs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "*"
      },
      {
        Sid    = "Artifacts"
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:GetObjectVersion", "s3:PutObject", "s3:ListBucket"]
        Resource = [
          aws_s3_bucket.pipeline_artifacts.arn,
          "${aws_s3_bucket.pipeline_artifacts.arn}/*",
        ]
      },
      {
        Sid    = "FrontendDeploy"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation",
        ]
        Resource = [
          aws_s3_bucket.frontend.arn,
          "${aws_s3_bucket.frontend.arn}/*",
        ]
      },
      {
        Sid    = "CloudFrontInvalidate"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:GetDistribution",
        ]
        Resource = aws_cloudfront_distribution.frontend.arn
      },
      {
        Sid    = "SsmRead"
        Effect = "Allow"
        Action = ["ssm:GetParameter", "ssm:GetParameters"]
        Resource = [
          aws_ssm_parameter.frontend_bucket.arn,
          aws_ssm_parameter.cloudfront_distribution_id.arn,
          aws_ssm_parameter.frontend_domain.arn,
        ]
      },
    ]
  })
}

resource "aws_codebuild_project" "billy" {
  name          = local.codebuild_name
  description   = "Billy: Vite build, S3 sync, CloudFront invalidate"
  service_role  = aws_iam_role.codebuild.arn
  build_timeout = 20

  depends_on = [aws_cloudwatch_log_group.codebuild]

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }
    environment_variable {
      name  = "FRONTEND_BUCKET_PARAM"
      value = aws_ssm_parameter.frontend_bucket.name
    }
    environment_variable {
      name  = "CLOUDFRONT_DISTRIBUTION_ID_PARAM"
      value = aws_ssm_parameter.cloudfront_distribution_id.name
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "pipeline/buildspec.yml"
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/billy/codebuild"
      stream_name = "billy-build"
    }
  }
}

resource "aws_cloudwatch_log_group" "codebuild" {
  name              = "/billy/codebuild"
  retention_in_days = 30
}

resource "aws_s3_object" "pipeline_source_seed" {
  bucket = aws_s3_bucket.pipeline_source.id
  key    = local.source_object_key

  # Minimal valid zip — replaced by GitHub Actions before real deploys.
  content_base64 = "UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=="
  content_type   = "application/zip"

  lifecycle {
    ignore_changes = [etag, content_base64]
  }
}

resource "aws_codepipeline" "billy" {
  name     = local.pipeline_name
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = aws_s3_bucket.pipeline_artifacts.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "S3"
      version          = "1"
      output_artifacts = ["SourceOutput"]

      configuration = {
        S3Bucket             = aws_s3_bucket.pipeline_source.bucket
        S3ObjectKey          = local.source_object_key
        PollForSourceChanges = false
      }
    }
  }

  stage {
    name = "BuildAndDeploy"

    action {
      name            = "BuildDeploy"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["SourceOutput"]

      configuration = {
        ProjectName = aws_codebuild_project.billy.name
      }
    }
  }

  depends_on = [aws_s3_object.pipeline_source_seed]
}
