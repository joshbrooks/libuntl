from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.utils.translation import ugettext_lazy as _
from django.db import models
from django_extensions.db.models import TimeStampedModel


class ResourceBase(TimeStampedModel):
    """
    Describes a single URL addressable resource
    """
    year = models.IntegerField(verbose_name=_('Year'), null=True, blank=True)
    name = JSONField(verbose_name=_('name'), null=True, blank=True)
    description = JSONField(null=True, blank=True, verbose_name=_('description'))
    pubtype = models.ForeignKey('Pubtype', verbose_name=_("Type"))

    author = models.ManyToManyField('Author', blank=True)
    organization = models.ManyToManyField('Organization', blank=True)

    cover = models.ImageField()
    user = models.ForeignKey(User)


class ResourceExternal(ResourceBase):
    """
    URLs which are offsite
    """
    url = models.URLField()


class ResourceUploaded(ResourceBase):
    file = models.FileField()


class Pubtype(models.Model):
    """
    Describes an object based on its type (eg newsletter, report...)
    """

    def __str__(self):
        return self.name

    code = models.CharField(max_length=3, primary_key=True)
    name = models.CharField(max_length=128)

    class Meta:
        verbose_name_plural = _("Publication Types")
        ordering = ('name',)


class Author(models.Model):
    name = JSONField(max_length=128, null=True, blank=True)
    description = JSONField(max_length=128, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = _("Authors")
        ordering = ('name',)


class Organization(models.Model):
    name = models.TextField()
    acronyms = JSONField(null=True, blank=True)
    description = JSONField(null=True, blank=True)


class Tag(models.Model):
    name = JSONField()
    description = JSONField(null=True, blank=True)
