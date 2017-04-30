from . import models
from rest_framework import serializers, viewsets
from rest_framework import routers

router = routers.SimpleRouter()

class OrganizationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Organization
        fields = '__all__'


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = models.Organization.objects.all()
    serializer_class = OrganizationModelSerializer


router.register(r'organization', OrganizationViewSet)


class AuthorModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Author
        fields = '__all__'


class AuthorViewSet(viewsets.ModelViewSet):
    queryset = models.Author.objects.all()
    serializer_class = AuthorModelSerializer


router.register(r'author', AuthorViewSet)


class PubtypeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Pubtype
        fields = '__all__'


class PubtypeViewSet(viewsets.ModelViewSet):
    queryset = models.Pubtype.objects.all()
    serializer_class = PubtypeModelSerializer


router.register(r'pubtype', PubtypeViewSet)


class ResourceBaseModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ResourceBase
        fields = '__all__'


class ResourceBaseViewSet(viewsets.ModelViewSet):
    queryset = models.ResourceBase.objects.all()
    serializer_class = ResourceBaseModelSerializer


router.register(r'resourcebase', ResourceBaseViewSet)


class TagModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Tag
        fields = '__all__'


class TagViewSet(viewsets.ModelViewSet):
    queryset = models.Tag.objects.all()
    serializer_class = TagModelSerializer


router.register(r'tag', TagViewSet)

urlpatterns = router.urls