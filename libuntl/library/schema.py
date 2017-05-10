import json

import django_filters
import graphene
from django import forms
from django_extensions.db.fields.json import JSONField
from graphene import resolve_only_args
from graphene_django.filter import DjangoFilterConnectionField

from graphene_django.types import DjangoObjectType

from .models import Resource, Link


class JsonValueFilter(django_filters.Filter):
    field_class = forms.CharField

    def __init__(self, *args, **kwargs):
        super(JsonValueFilter, self).__init__(*args, **kwargs)

    def filter(self, qs, value):
        if not value:
            return qs
        # TODO: Change this to use a "raw" filter method to get values containing text
        qs = self.get_method(qs)(**{'%s__values__contains' % (self.name): value})
        return qs.distinct()

class JsonValueContainsFilter(django_filters.FilterSet):
    # Do case-insensitive lookups icontains lookup on values
    name = JsonValueFilter()

    class Meta:
        model = Resource
        fields = ['name','id']

class ResourceNode(DjangoObjectType):

    class Meta:
        model = Resource

        filter_fields = {
            'id': ['exact'],
            'modified': ['gt', 'gte', 'lt', 'lte']
        }
        interfaces = (graphene.relay.Node, )

class Query(graphene.AbstractType):
    resource = graphene.relay.Node.Field(ResourceNode)
    all_resources = DjangoFilterConnectionField(
        ResourceNode
    )