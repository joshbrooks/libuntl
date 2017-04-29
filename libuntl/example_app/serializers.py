from .models import ExampleModel
from rest_framework import serializers


class ExampleModelSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
            model = ExampleModel
            fields = ('url', 'text')
