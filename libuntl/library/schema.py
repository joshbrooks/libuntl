import graphene

from graphene_django.types import DjangoObjectType

from .models import Resource, Link


class ResourceType(DjangoObjectType):
    class Meta:
        model = Resource


class LinkType(DjangoObjectType):
    class Meta:
        model = Link


class Query(graphene.AbstractType):
    all_resources = graphene.List(ResourceType)
    all_links = graphene.List(LinkType)

    def resolve_all_resources(self, args, context, info):
        return Resource.objects.all()

    def resolve_all_links(self, args, context, info):
        return Link.objects.select_related('resource').all()