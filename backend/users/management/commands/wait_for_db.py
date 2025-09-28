import time
from django.db import connections
from django.db.utils import OperationalError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Django command to pause execution until database is available"""
    
    help = 'Wait for database to be available'
    
    def handle(self, *args, **options):
        self.stdout.write('Waiting for database...')
        db_conn = None
        
        max_retries = 30  # Maximum number of retries
        retry_interval = 2  # Seconds between retries
        
        for attempt in range(max_retries):
            try:
                db_conn = connections['default']
                db_conn.cursor().execute('SELECT 1')
                self.stdout.write(self.style.SUCCESS('Database available!'))
                return
            except OperationalError:
                self.stdout.write(f'Database unavailable, waiting {retry_interval} seconds... (attempt {attempt+1}/{max_retries})')
                time.sleep(retry_interval)
        
        self.stdout.write(self.style.ERROR('Database connection failed after maximum retries!'))
        exit(1)  # Exit with error code
