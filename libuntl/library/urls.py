from django.conf import settings
from django.conf.urls import url, include
from django.contrib import admin
from . import views

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.

urlpatterns = [
    url(r'^$', views.ResourceList.as_view()),
    url(r'stats/$', views.Stats.as_view()),
    url(r'index/$', views.Index.as_view()),
    url(r'modified/$', views.Modified.as_view()),
    url(r'upload/$', views.Upload.as_view()),
    url(r'lookups/$', views.Lookups.as_view()),
]