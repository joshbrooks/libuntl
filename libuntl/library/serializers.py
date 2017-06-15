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
    pagination_class = LimitOffsetPagination
    filter_backends=(TimeStampFilter,)
    ordering_fields='modified'


router.register(r'organization', OrganizationViewSet)


class AuthorModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Author
        fields = ('name','modified','id')


class AuthorViewSet(viewsets.ModelViewSet):
    queryset = models.Author.objects.all()
    serializer_class = AuthorModelSerializer
    pagination_class = LimitOffsetPagination
    filter_backends=(TimeStampFilter,)

router.register(r'author', AuthorViewSet)


class PublicationTypeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PublicationType
        fields = '__all__'


class PublicationTypeViewSet(viewsets.ModelViewSet):
    queryset = models.PublicationType.objects.all()
    serializer_class = PublicationTypeModelSerializer


router.register(r'pubtype', PublicationTypeViewSet)


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
    pagination_class = LimitOffsetPagination
    serializer_class = TagModelSerializer
    filter_backends = (TimeStampFilter,)

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