from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User


class IndexViewTests(TestCase):

    def setup(self):
        User.objects.create_user('example_user', 'example_user@example.com', 'example_password')

    def test_secured_index_view_has_status_code_200(self):
        self.client.login(username='example_user', password='example_password')
        response = self.client.get(reverse('index'), follow=True)
        self.assertEqual(response.status_code, 200)
