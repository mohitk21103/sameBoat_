import os
from celery import Celery
import multiprocessing
multiprocessing.set_start_method("spawn", force=True)


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sameboat.settings")

app = Celery("sameboat")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

