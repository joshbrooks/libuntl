from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required

from rest_framework import routers

from example_app.views import IndexView, ExampleModelViewSet

router = routers.DefaultRouter()
router.register(r'examplemodels', ExampleModelViewSet)


urlpatterns = [
    url(r'^$', IndexView.as_view(), name='public'),
    url(r'^private/$', login_required(IndexView.as_view()), name='index'),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
    ]
