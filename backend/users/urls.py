from django.urls import path, include
from rest_framework import routers
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from users.api.viewsets import(
    UserRegisterViewSet,
    JobViewSet,
)

from users.api.auth_views import(
    UserLoginView,
    UserLogoutView,
    UserRefreshFromCookieView,
    UserPasswordSendResetLinkView,
    UserResetPasswordView,
)

from users.api.health_views import health_check, readiness_check, liveness_check, celery_health_check

router = DefaultRouter()
router.register("register-user", UserRegisterViewSet, "user")
router.register("jobs", JobViewSet, "jobs")

urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('api/v1/login/', UserLoginView.as_view(), name='token_obtain_pair'),
    path("api/v1/refresh", UserRefreshFromCookieView.as_view(), name="token_refresh"),
    path("api/v1/logout", UserLogoutView.as_view(), name="user_logout"),
    path("api/v1/send-reset-password-link", UserPasswordSendResetLinkView.as_view(), name="user_password_rest_link"),
    path("api/v1/reset-password/<str:uid>/<str:token>", UserResetPasswordView.as_view(), name="reset_password"),
    
    # Health check endpoints
    path("health/", health_check, name="health_check"),
    path("health/ready", readiness_check, name="readiness_check"),
    path("health/alive", liveness_check, name="liveness_check"),
    path("health/celery", celery_health_check, name="celery_health_check"),
]
