from django.db import models
import uuid
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from storages.backends.s3boto3 import S3Boto3Storage

s3_storage = S3Boto3Storage()

class CustomUserManager(BaseUserManager):
    def create_user(self, email, user_name, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        if not user_name:
            raise ValueError(_('The Username field must be set'))

        email = self.normalize_email(email)
        user = self.model(email=email, user_name=user_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, user_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, user_name, password, **extra_fields)


class Users(AbstractBaseUser, PermissionsMixin):
    user_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user_name = models.CharField(_("User Name"), max_length=50, unique=True)
    first_name = models.CharField(_("First Name"), max_length=100)
    last_name = models.CharField(_("Last Name"), max_length=100, blank=True)
    email = models.EmailField(_("Email"), unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Required for Django auth
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_name']

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.user_name
    

class Jobs(models.Model):
    
    class EmploymentType(models.TextChoices):
        FULL_TIME = "FULLTIME", _("Full Time")
        PART_TIME = "PARTTIME", _("Part Time")
        INTERNSHIP = "INTERNSHIP", _("Internship")
        CONTRACT = "CONTRACT", _("Contract")

    class CurrentStatus(models.TextChoices):
        SAVED = "SAVED", _("Saved")
        APPLIED = "APPLIED", _("Applied")
        SHORTLISTED = "SHORTLISTED", _("Shortlisted")
        INTERVIEW = "INTERVIEW", _("Interview")
        OFFER = "OFFER", _("Offer")
        REJECTED = "REJECTED", _("Rejected")

    job_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("Users", on_delete=models.CASCADE, related_name="jobs")

    job_title = models.CharField(_("Job Title"), max_length=200)
    company_name = models.CharField(_("Company Name"), max_length=250)
    location = models.CharField(_("Location"), max_length=300, blank=True)

    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME
    )

    experience_required = models.CharField(_("Experience"), max_length=20)
    skills = models.JSONField(_("Skills"), default=list, blank=True)

    current_status = models.CharField(
        max_length=20,
        choices=CurrentStatus.choices,
        default=CurrentStatus.SAVED
    )

    applied_date = models.DateField(blank=True, null=True)
    notes = models.JSONField(_("Notes"), default=list, blank=True)
    is_active = models.BooleanField(_("Is Active"), default=True)
    job_url = models.URLField(_("Job URL"), max_length=500, blank=True)
    
    resume = models.FileField(_("Resume"), upload_to="resumes/", blank=True)
    cover_letter = models.FileField(_("Cover Letter"), upload_to="cover_letters/", blank=True)

    resume_url = models.URLField(blank=True)        # store S3 URL after upload
    cover_letter_url = models.URLField(blank=True)  # store S3 URL after upload

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "jobs"


    def __str__(self):
        return f"{self.job_title} at {self.company_name}"

            