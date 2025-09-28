from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up production database and create initial data'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Setting up production database...')
        
        # Create superuser if it doesn't exist
        if not User.objects.filter(is_superuser=True).exists():
            username = os.getenv('ADMIN_USERNAME', 'admin')
            email = os.getenv('ADMIN_EMAIL', 'admin@example.com')
            password = os.getenv('ADMIN_PASSWORD', 'admin123')
            
            User.objects.create_superuser(username, email, password)
            self.stdout.write(
                self.style.SUCCESS(f'✅ Superuser created: {username}')
            )
        else:
            self.stdout.write('ℹ️ Superuser already exists')
        
        # Load initial data if fixtures exist
        try:
            from django.core.management import call_command
            call_command('loaddata', 'initial_Users.json', verbosity=0)
            call_command('loaddata', 'jobs.json', verbosity=0)
            self.stdout.write('✅ Initial data loaded successfully')
        except Exception as e:
            self.stdout.write(f'⚠️ Could not load initial data: {e}')
        
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result:
                self.stdout.write('✅ Database connection successful')
        
        self.stdout.write('🎉 Production setup completed!')
