from django.shortcuts import render
from django.views.generic import View, TemplateView
from library.models import Resource, Author, Organization
from django.shortcuts import HttpResponse
from rest_framework.renderers import JSONRenderer

class ResourceList(TemplateView):
    template_name = 'library/list.html'

class Stats(View):
    """
    Returns object counts and and data for graphs
    """
    def get(self, request, *args, **kwargs):

        def render_model(model, with_modified=True):
            render = {}
            render['count'] = model.objects.count()
            if with_modified:
                render['last_modified'] = model.objects.order_by('-modified').first().modified
                render['first_modified'] = model.objects.order_by('modified').first().modified
            return render

        counts = {
            'resource': render_model(Resource),
            'authors': render_model(Author),
            'organization': render_model(Organization)
        }

        return HttpResponse(JSONRenderer().render(counts))


class Modified(View):
    def get(self, request, *args, **kwargs):
        models = {'resource': Resource,
                  'author': Author,
                  'organization': Organization
                  }

        counts = {}
        for name, model in models.items():
            first = model.objects.order_by('modified').first().modified
            counts[name] = [(o[0], (o[1]-first).microseconds) for o in model.objects.all().values_list('id', 'modified')]

        return HttpResponse(JSONRenderer().render(counts), content_type='application/json')
