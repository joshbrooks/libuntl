import datetime
import json

from django.core.exceptions import FieldError
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.views.generic import View, TemplateView
from rest_framework.utils.encoders import JSONEncoder

from library.models import Resource, Author, Organization, Tag
from django.shortcuts import HttpResponse
from rest_framework.renderers import JSONRenderer
from django.contrib.contenttypes.models import ContentType

app_label = 'library'


class ResourceList(TemplateView):
    def get_context_data(self, **kwargs):
        context = super(TemplateView, self).__init__() or {}
        context['counts'] = mark_safe(json.dumps(resource_stats(as_response=False), cls=JSONEncoder, indent=1))
        return context

    template_name = 'library/list.html'


class Stats(View):
    """
    Returns object counts and and data for graphs
    """

    def get(self, request, *args, **kwargs):
        # return resource_stats()
        return resource_mtimes(request)


class Upload(View):
    """
    Uploads
    """
    def post(self, request, *args, **kwargs):

        raise AssertionError
        return

class Index(View):
    """
    Create indexes of the words contained in Resource title
    """

    def get(self, request, *args, **kwargs):
        r = {}

        for resource in Resource.objects.all():
            for word_set in resource.name.values():
                for word in word_set.split(' '):
                    word_lower = word.lower()
                    if word_lower not in r:
                        # Brackets
                        word_lower.replace('(', '')
                        word_lower.replace(')', '')
                        word_lower.replace('\r', '')
                        word_lower.replace('\n', '')
                        word_lower.replace('.', '')
                        r[word_lower] = []
                        if word_lower.isdigit():
                            continue
                    if resource.id in r[word_lower]:
                        continue
                    if word_lower == '':
                        continue
                    r[word_lower].append(resource.id)

        return JsonResponse(r, encoder=JSONEncoder)


class Modified(View):
    def get(self, request, *args, **kwargs):
        models = {'resource': Resource,
                  'author': Author,
                  'organization': Organization
                  }

        counts = {}
        for name, model in models.items():
            first = model.objects.order_by('modified').first().modified
            counts[name] = [(o[0], (o[1] - first).microseconds) for o in
                            model.objects.all().values_list('id', 'modified')]

        return JsonResponse(counts, encoder=JSONEncoder)


def resource_stats(as_response=True):
    def render_model(model, with_modified=True):
        stat = {}
        stat['count'] = model.objects.count()
        if stat['count'] > 0 and with_modified:
            try:
                stat['last_modified'] = model.objects.order_by('-modified').first().modified
                stat['first_modified'] = model.objects.order_by('modified').first().modified
            except FieldError:
                with_modified = False
                pass
        return stat

    counts = {}

    ct_models = ContentType.objects.filter(app_label=app_label)
    for ct_model in ct_models:
        model = ct_model.model_class()
        if model:
            counts[ct_model.name] = render_model(model)
    if as_response:
        return JsonResponse(counts, json_dumps_params={'indent': 1}, encoder=JSONEncoder)
    else:
        return counts


def resource_mtimes(request):
    since = request.GET.get('since', None)
    fields = ('id', 'modified')
    return resource_properties(since=since, fields=fields)


def resource_properties(app_label='library', model_label=None, since=None, fields=('id', 'modified'), objects=None):
    counts = {}
    counts['time'] = datetime.datetime.now()
    ct_models = ContentType.objects.all()
    if app_label:
        ct_models = ct_models.filter(app_label=app_label)
    if model_label:
        ct_models = ct_models.filter(model=model_label)

    for ct_model in ct_models:

        model = ct_model.model_class()
        if model:
            counts[ct_model.name] = []
            first_modified = model.objects.order_by('-modified', 'id').first().modified

            objects = model.objects.filter(modified__lt=counts['time'])
            if since:
                objects = objects.filter(modified__gt=since).order_by('-modified', 'id')

            for i in objects.order_by('-modified', 'id'):
                counts[ct_model.name].append([getattr(i, field_name, None) for field_name in fields])

    return JsonResponse(counts, encoder=JSONEncoder)


def id_and_modified_times(app_label, model_label):
    r = ContentType.objects.filter(app_label=app_label, model_label=model_label).model_class.values('id', 'modified')
    return JsonResponse(r, json_dumps_params={'indent': 1}, encoder=JSONEncoder)
