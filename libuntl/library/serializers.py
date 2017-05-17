from rest_framework.filters import BaseFilterBackend
from rest_framework.pagination import LimitOffsetPagination

from . import models
from rest_framework import serializers, viewsets
from rest_framework import routers
import django_filters

router = routers.SimpleRouter()


class TimeStampFilter(BaseFilterBackend):
    """
    Filter that returns only objects modified since a given date
    """
    def filter_queryset(self, request, queryset, view):
        if 'modified__gt' in request.GET:
            queryset = queryset.filter(modified__gt=request.GET['modified__gt'])
        if 'modified__lt' in request.GET:
            queryset = queryset.filter(modified__lt=request.GET['modified__lt'])
        return queryset


class OrganizationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Organization
        fields = '__all__'


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = models.Organization.objects.all()
    serializer_class = OrganizationModelSerializer
    filter_backends=(TimeStampFilter,)
    ordering_fields='modified'


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


class ResourceModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Resource
        fields = '__all__'


class ResourceBaseViewSet(viewsets.ModelViewSet):
    queryset = models.Resource.objects.prefetch_related('author', 'organization')
    serializer_class = ResourceModelSerializer
    pagination_class = LimitOffsetPagination
    filter_backends=(TimeStampFilter,)
    ordering_fields='modified'

router.register(r'resource', ResourceBaseViewSet)


class TagModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Tag
        fields = '__all__'


class TagViewSet(viewsets.ModelViewSet):
    queryset = models.Tag.objects.all()
    serializer_class = TagModelSerializer

router.register(r'tag', TagViewSet)


class LinkModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Link
        fields = '__all__'


class LinkViewSet(viewsets.ModelViewSet):
    queryset = models.Link.objects.all()
    serializer_class = LinkModelSerializer


router.register(r'Link'.lower(), LinkViewSet)

urlpatterns = router.urls