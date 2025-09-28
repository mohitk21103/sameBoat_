from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis
import os
import psutil
import time

def health_check(request):
    """
    Comprehensive health check endpoint that verifies:
    1. Django app is running
    2. Database connection works
    3. Redis connection works
    4. System resources (memory, CPU)
    """
    start_time = time.time()
    health_status = {
        "status": "healthy",
        "service": "sameboat-backend",
        "timestamp": time.time(),
        "checks": {},
        "system": {}
    }
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        health_status["checks"]["database"] = "ok"
    except Exception as e:
        health_status["checks"]["database"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check Redis
    try:
        cache.set('health_check', 'ok', 10)
        result = cache.get('health_check')
        if result != 'ok':
            raise Exception("Cache check failed")
        health_status["checks"]["redis"] = "ok"
    except Exception as e:
        health_status["checks"]["redis"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # System metrics
    try:
        health_status["system"]["memory"] = {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent
        }
        health_status["system"]["cpu"] = {
            "percent": psutil.cpu_percent(interval=0.1),
            "count": psutil.cpu_count()
        }
        health_status["system"]["disk"] = {
            "total": psutil.disk_usage('/').total,
            "free": psutil.disk_usage('/').free,
            "percent": psutil.disk_usage('/').percent
        }
    except Exception as e:
        health_status["system"]["error"] = str(e)
    
    # Response time
    health_status["response_time_ms"] = (time.time() - start_time) * 1000
    
    # Return appropriate HTTP status
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JsonResponse(health_status, status=status_code)

def readiness_check(request):
    """
    Simplified readiness check - used by Kubernetes to determine if
    the container is ready to receive traffic
    """
    return JsonResponse({"status": "ready"}, status=200)

def liveness_check(request):
    """
    Simplified liveness check - used by Kubernetes to determine if
    the container is alive
    """
    return JsonResponse({"status": "alive"}, status=200)
