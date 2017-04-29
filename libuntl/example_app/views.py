from django.views.generic.base import TemplateView

from rest_framework import viewsets

from .serializers import ExampleModelSerializer
from .models import ExampleModel


class IndexView(TemplateView):
    template_name = 'example_app/index.html'


class ExampleModelViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = ExampleModel.objects.all()
    serializer_class = ExampleModelSerializer
