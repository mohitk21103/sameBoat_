from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.conf import settings

from users.api.serializers import MyTokenObtainPairSerializer, UserPasswordResetLinkSerializer, UserPasswordResetConfirmSerializer
from users.api.utils import set_refresh_cookie, clear_refresh_cookie



# LOGIN: returns access in body, refresh in HttpOnly cookie
class UserLoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # (Optional) enforce CSRF if you're using cookie-based flows
        response = super().post(request, *args, **kwargs)
        refresh = response.data.get('refresh')
        access = response.data.get('access')
        

        if refresh:
            set_refresh_cookie(response, refresh)
            # do not expose refresh to JS / body in prod
            del response.data['refresh']
        
        # overwrite the body
        response.data = {"token": access}
        response.status_code = status.HTTP_200_OK

        return response

# REFRESH: reads refresh token from cookie, returns new access (+ new refresh cookie if rotation)
class UserRefreshFromCookieView(APIView):
    permission_classes = [permissions.AllowAny]  # add CSRF protection in middleware

    def post(self, request):
        refresh_cookie = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
        if not refresh_cookie:
            return Response({"detail": "No refresh cookie"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={'refresh': refresh_cookie})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        response = Response({"access": data["access"]}, status=status.HTTP_200_OK)

        # If rotation is ON, serializer returns a new refresh token too
        new_refresh = data.get("refresh")
        if new_refresh:
            set_refresh_cookie(response, new_refresh)
        return response


class UserLogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_cookie = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)

        response = Response(status=status.HTTP_205_RESET_CONTENT)

        if refresh_cookie:
            try:
                token = RefreshToken(refresh_cookie)
                token.blacklist() 
            except TokenError:
                # invalid/already-blacklisted: still clear the cookie
                pass

        clear_refresh_cookie(response)

        response.data = {"message": "Logout Successfully"}
        return response


class UserPasswordSendResetLinkView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserPasswordResetLinkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset link sent to email"}, status=200)
        return Response(serializer.errors, status=400)


class UserResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, uid, token):
        serializer = UserPasswordResetConfirmSerializer(
            data = request.data,
            context={"uid": uid, "token":token}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Password reset successful"})
