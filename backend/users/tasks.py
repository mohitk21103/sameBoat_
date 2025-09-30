import os
from celery import shared_task
from django.conf import settings
from users.models import Jobs
from sameboat.services.s3_service import S3Service



@shared_task
def upload_file_to_s3(job_id, field_name, local_path):
    """
    Upload a file to S3 in the background, update DB with S3 URL, and delete local file.
    DEPRECATED: Use upload_file_obj_to_s3 instead for better container compatibility.
    """
    # Validate inputs
    if not job_id:
        return "❌ Error: job_id is required"
    if not field_name:
        return "❌ Error: field_name is required"
    if not local_path:
        return "❌ Error: local_path is required"
    
    allowed_fields = ["resume_url", "cover_letter_url"]
    if field_name not in allowed_fields:
        return f"❌ Error: Invalid field_name '{field_name}'. Must be one of {allowed_fields}"

    # Check if file exists
    if not os.path.exists(local_path):
        return f"❌ Error: File not found at {local_path}"

    try:
        # Check AWS settings
        if not settings.AWS_ACCESS_KEY_ID:
            return "❌ Error: AWS_ACCESS_KEY_ID not configured"
        if not settings.AWS_SECRET_ACCESS_KEY:
            return "❌ Error: AWS_SECRET_ACCESS_KEY not configured"
        if not settings.AWS_STORAGE_BUCKET_NAME:
            return "❌ Error: AWS_STORAGE_BUCKET_NAME not configured"
        if not settings.AWS_S3_REGION_NAME:
            return "❌ Error: AWS_S3_REGION_NAME not configured"

        job = Jobs.objects.get(pk=job_id)
        file_name = os.path.basename(local_path)
        s3_key = f"user_uploads/{job.user_id}/{file_name}"

        s3 = S3Service()
        file_url = s3.upload_file_to_s3(local_path, s3_key)

        # Save URL to job model
        setattr(job, field_name, file_url)
        job.save(update_fields=[field_name])

        # Delete local file
        if os.path.exists(local_path):
            os.remove(local_path)

        return f"✅ uploaded {file_name} successfully"

    except Jobs.DoesNotExist:
        return f"❌ Error: Job with id {job_id} not found"
    except Exception as e:
        return f"❌ Error: {str(e)}"


@shared_task
def upload_file_obj_to_s3(job_id, field_name, file_data, filename):
    """
    Upload file data directly to S3 without local storage.
    This is the preferred method for containerized deployments.
    """
    # Validate inputs
    if not job_id:
        return "❌ Error: job_id is required"
    if not field_name:
        return "❌ Error: field_name is required"
    if not file_data:
        return "❌ Error: file_data is required"
    if not filename:
        return "❌ Error: filename is required"
    
    allowed_fields = ["resume_url", "cover_letter_url"]
    if field_name not in allowed_fields:
        return f"❌ Error: Invalid field_name '{field_name}'. Must be one of {allowed_fields}"

    try:
        # Check AWS settings
        if not settings.AWS_ACCESS_KEY_ID:
            return "❌ Error: AWS_ACCESS_KEY_ID not configured"
        if not settings.AWS_SECRET_ACCESS_KEY:
            return "❌ Error: AWS_SECRET_ACCESS_KEY not configured"
        if not settings.AWS_STORAGE_BUCKET_NAME:
            return "❌ Error: AWS_STORAGE_BUCKET_NAME not configured"
        if not settings.AWS_S3_REGION_NAME:
            return "❌ Error: AWS_S3_REGION_NAME not configured"

        job = Jobs.objects.get(pk=job_id)
        s3_key = f"user_uploads/{job.user_id}/{filename}"

        s3 = S3Service()
        
        # Convert base64 data back to bytes
        import base64
        file_bytes = base64.b64decode(file_data)
        
        # Create a file-like object from bytes
        from io import BytesIO
        file_obj = BytesIO(file_bytes)
        
        file_url = s3.upload_file_obj_to_s3(file_obj, s3_key, filename)

        # Save URL to job model
        setattr(job, field_name, file_url)
        job.save(update_fields=[field_name])

        

        return f"✅ uploaded {filename} successfully"

    except Jobs.DoesNotExist:
        return f"❌ Error: Job with id {job_id} not found"
    except Exception as e:
        return f"❌ Error: {str(e)}"


@shared_task
def delete_from_s3_task(key):
    s3 = S3Service()
    s3.delete_file_from_s3(key)
    return f"✅ Deleted {key} from S3"


@shared_task
def test_celery_task():
    """
    Simple test task to verify Celery is working
    """
    import time
    time.sleep(1)  # Simulate some work
    return "✅ Celery test task completed successfully!"

@shared_task
def heartbeat_task():
    """
    Periodic heartbeat task to keep worker alive
    """
    import time
    return f"💓 Heartbeat at {time.time()}"
