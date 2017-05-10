from django.shortcuts import render
from django.views.generic import TemplateView


class ResourceList(TemplateView):
    template_name = 'library/list.html'
