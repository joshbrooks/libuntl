"""project_name URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url, include
from django.contrib import admin

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.

urlpatterns = [
    url(r'^', include('example_app.urls')),
    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^library/api/', include('library.serializers')),
]

if 'rosetta' in settings.INSTALLED_APPS:
    urlpatterns += [url(r'^rosetta/', include('rosetta.urls'))]

if 'debug_toolbar' in settings.INSTALLED_APPS:
    import debug_toolbar
    urlpatterns += [url(r'^__debug__/', include(debug_toolbar.urls))]

if 'rest_framework_swagger' in settings.INSTALLED_APPS:
    from rest_framework_swagger.views import get_swagger_view
    urlpatterns += [
        url(r'^swagger/', get_swagger_view(title='My Swagger'))
    ]

if 'graphene_django' in settings.INSTALLED_APPS:
    from graphene_django.views import GraphQLView
    urlpatterns += [
        url(r'^graphql', GraphQLView.as_view(graphiql=True))
    ]

# For django_js_reverse
def javascript_settings():
    return {
        'page_title': 'Home',
        'page_version': '1.9.20',
        'css': {
            'white': './css/white.css',
            'black': './css/black.css',
            'print': './css/print.css',
        },
        'default_css': 'white',
    }
