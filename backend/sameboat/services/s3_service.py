import boto3
import mimetypes
from botocore.exceptions import ClientError
from django.conf import settings


class S3Service:
    def __init__(self):
        # Validate AWS settings
        if not settings.AWS_ACCESS_KEY_ID:
            raise ValueError("AWS_ACCESS_KEY_ID is not configured")
        if not settings.AWS_SECRET_ACCESS_KEY:
            raise ValueError("AWS_SECRET_ACCESS_KEY is not configured")
        if not settings.AWS_STORAGE_BUCKET_NAME:
            raise ValueError("AWS_STORAGE_BUCKET_NAME is not configured")
        if not settings.AWS_S3_REGION_NAME:
            raise ValueError("AWS_S3_REGION_NAME is not configured")
            
        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
        self.bucket = settings.AWS_STORAGE_BUCKET_NAME

    def upload_file_to_s3(self, local_path, key):
        """Upload file to S3 with correct ContentType and inline disposition"""
        try:
            # Auto-detect MIME type (default to binary)
            content_type, _ = mimetypes.guess_type(local_path)
            content_type = content_type or "application/octet-stream"

            self.client.upload_file(
                local_path,
                self.bucket,
                key,
                ExtraArgs={
                    "ContentType": content_type,
                    "ContentDisposition": "inline",
                },
            )
            return f"https://{self.bucket}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{key}"

        except ClientError as e:
            raise Exception(f"S3 upload failed: {e}")

    def delete_file_from_s3(self, key):
        """Delete file from S3"""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as e:
            raise Exception(f"S3 delete failed: {e}")

    def generate_presigned_url(self, key, expires_in=3600):
        """Generate a presigned URL"""
        try:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
        except ClientError as e:
            raise Exception(f"S3 presigned URL failed: {e}")
