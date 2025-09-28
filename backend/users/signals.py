from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import Jobs
from users.tasks import delete_from_s3_task
from urllib.parse import urlparse


def extract_key(file_url):
    """Extract the S3 key from a full S3 file URL (with or without region)."""
    if not file_url:
        return None
    parsed = urlparse(file_url)
    return parsed.path.lstrip("/")

@receiver(post_delete, sender=Jobs)
def delete_job_files_from_s3(sender, instance, **kwargs):
    """
    When a Job is deleted, enqueue file deletion as async Celery tasks.
    """
    for url in [instance.resume_url, instance.cover_letter_url]:
        key = extract_key(url)
        if key:
            delete_from_s3_task.delay(key)
