resource "aws_s3_bucket" "pipeline_source" {
  bucket = "billy-pipeline-source-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "pipeline_source" {
  bucket = aws_s3_bucket.pipeline_source.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "pipeline_source" {
  bucket = aws_s3_bucket.pipeline_source.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "pipeline_source" {
  bucket = aws_s3_bucket.pipeline_source.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
