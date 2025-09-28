from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, mixins, status
from users.models import Users, Jobs
from users.api.serializers import(
    JobReadSerializer, 
    JobWriteSerializer, 
    UserRegisterSerializer,

)



class MessageMixinViewSet(viewsets.ModelViewSet):
    success_messages = {
        "create": "Created successfully",
        "update": "Updated successfully",
        "destroy": "Deleted successfully"
    }

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(
            {"message": self.success_messages.get("create"), "data": response.data},
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response(
            {"message": self.success_messages.get("update"), "data": response.data},
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response(
            {"message": self.success_messages.get("destroy")},
            status=status.HTTP_204_NO_CONTENT
        )



class UserRegisterViewSet(MessageMixinViewSet):
    queryset = Users.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer
    http_method_names = ["post"] #allow only POST for registration



class JobViewSet(MessageMixinViewSet):
    queryset = Jobs.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return JobWriteSerializer
        return JobReadSerializer


    def get_queryset(self):
        return Jobs.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)