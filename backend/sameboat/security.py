"""
Security configurations and utilities for production deployment.
"""

import os
from django.conf import settings

def get_security_headers():
    """
    Return security headers for production deployment.
    """
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
    }

def validate_file_upload(file):
    """
    Validate uploaded file for security.
    """
    # Allowed file types
    allowed_extensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif']
    allowed_mime_types = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
    ]
    
    # Check file extension
    file_ext = os.path.splitext(file.name)[1].lower()
    if file_ext not in allowed_extensions:
        return False, f"File type {file_ext} not allowed"
    
    # Check MIME type
    if hasattr(file, 'content_type') and file.content_type not in allowed_mime_types:
        return False, f"MIME type {file.content_type} not allowed"
    
    # Check file size (50MB limit)
    max_size = 50 * 1024 * 1024  # 50MB
    if file.size > max_size:
        return False, f"File size {file.size} exceeds limit of {max_size} bytes"
    
    return True, "File validation passed"

def sanitize_filename(filename):
    """
    Sanitize filename to prevent directory traversal attacks.
    """
    import re
    # Remove any path components
    filename = os.path.basename(filename)
    # Remove dangerous characters
    filename = re.sub(r'[^\w\-_\.]', '', filename)
    # Ensure it's not empty
    if not filename:
        filename = 'file'
    return filename
