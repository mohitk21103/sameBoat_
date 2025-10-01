from rest_framework import serializers
from users.models import Users, Jobs
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import pytz
from rest_framework_simplejwt.tokens import RefreshToken, TokenError 

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, smart_str
from django.core.mail import send_mail
from django.conf import settings
from users.tasks import upload_file_to_s3, upload_file_obj_to_s3, delete_from_s3_task
from users.signals import extract_key
import base64

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Users
        fields = [
            "user_name",
            "first_name",
            "last_name",
            "email",
            "password"
        ]

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "password" in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        return super().update(instance, validated_data)

    

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        # get email and password from request
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = Users.objects.get(email=email)
            

        except Users.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password")
        
        
        # generate token
        data = super().validate(attrs)

        # print(data)

        data["user_id"] = user.user_id
        data["email"] = user.email

        return data



class UserLogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    
    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except TokenError:
            self.fail("bad_token")
    


class UserPasswordResetLinkSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value

    def save(self):
        user = Users.objects.get(email=self.validated_data['email'])
        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.user_id))
        reset_link = f"https://sameboat.onrender.com/reset_password.html?uid={uid}&token={token}"
        
        # print(reset_link)  # Replace with send_email(reset_link)

        send_mail(
            subject="SameBoat - Password Reset",
            message=(
                "Hi there,\n\n"
                "We received a request to reset your SameBoat password. No worries—just click the link below to choose a new one:\n\n"
                f"{reset_link}\n\n"
                "This link expires in a few minutes for your security. If you didn’t make this request, you can safely ignore this email—your password won’t change.\n\n"
                "Need help? We're here for you:\n"
                "📬 Contact us: https://sameboat.onrender.com/contact.html\n"
                "🔗 Connect on LinkedIn: https://www.linkedin.com/in/mohit-kanojiya/\n\n"
                "Stay afloat,\n"
                "Team SameBoat "
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[self.validated_data['email']],
            fail_silently=False,
        )



class UserPasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        uid = self.context.get("uid")
        token = self.context.get("token")

        try:
            user_id = smart_str(urlsafe_base64_decode(uid))
            user = Users.objects.get(pk=user_id)
        except (Users.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError("Invalid or expired reset link.")
        
        if not PasswordResetTokenGenerator().check_token(user, token):
            raise serializers.ValidationError("This password reset link has expired.")

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()
            

class JobWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating Jobs with S3 file handling
    """
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    notes = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Jobs
        fields = [
            "job_title",
            "company_name",
            "location",
            "employment_type",
            "experience_required",
            "skills",
            "current_status",
            "applied_date",
            "notes",
            "job_url",
            "resume",
            "cover_letter",
            "is_active",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        validated_data["is_active"] = True

        # Remove resume and cover_letter from validated_data before saving
        resume = validated_data.pop("resume", None)
        cover_letter = validated_data.pop("cover_letter", None)

        job = super().create(validated_data)

        # If resume uploaded → send to background with direct S3 upload
        if resume:
            resume.seek(0)
            file_data = base64.b64encode(resume.read()).decode('utf-8')
            filename = resume.name.split('/')[-1]
            upload_file_obj_to_s3.delay(job.job_id, "resume_url", file_data, filename)

        if cover_letter:
            cover_letter.seek(0)
            file_data = base64.b64encode(cover_letter.read()).decode('utf-8')
            filename = cover_letter.name.split('/')[-1]
            upload_file_obj_to_s3.delay(job.job_id, "cover_letter_url", file_data, filename)

        return job

    def update(self, instance, validated_data):
        if "is_active" not in validated_data:
            validated_data["is_active"] = True

        # Handle resume replacement
        if "resume" in validated_data:
            new_resume = validated_data.pop("resume")

            # If an old resume exists → delete from S3
            if instance.resume_url:
                old_key = extract_key(instance.resume_url)
                delete_from_s3_task.delay(old_key)

            # Do NOT save new resume locally; just upload to S3
            new_resume.seek(0)
            file_data = base64.b64encode(new_resume.read()).decode('utf-8')
            filename = new_resume.name.split('/')[-1]
            upload_file_obj_to_s3.delay(instance.job_id, "resume_url", file_data, filename)

        # Handle cover_letter replacement
        if "cover_letter" in validated_data:
            new_cover_letter = validated_data.pop("cover_letter")

            if instance.cover_letter_url:
                old_key = extract_key(instance.cover_letter_url)
                delete_from_s3_task.delay(old_key)

            # Do NOT save new cover letter locally; just upload to S3
            new_cover_letter.seek(0)
            file_data = base64.b64encode(new_cover_letter.read()).decode('utf-8')
            filename = new_cover_letter.name.split('/')[-1]
            upload_file_obj_to_s3.delay(instance.job_id, "cover_letter_url", file_data, filename)

        # Update non-file fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance



class JobReadSerializer(serializers.ModelSerializer):
    """
    Serializer for reading Jobs
    """
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", default_timezone=pytz.timezone('Asia/Kolkata'))

    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", default_timezone=pytz.timezone("Asia/Kolkata"))

    applied_date = serializers.DateField(format="%d-%m-%Y", input_formats=["%d-%m-%Y", "%Y-%m-%d"], required=False)

    class Meta:
        model = Jobs
        fields = [
            "job_id",
            "job_title",
            "company_name",
            "location",
            "employment_type",
            "experience_required",
            "skills",
            "current_status",
            "applied_date",
            "notes",
            "job_url",
           "resume_url", 
           "cover_letter_url",
            "created_at",
            "updated_at",
            "is_active",
        ]
        read_only_fields = fields

