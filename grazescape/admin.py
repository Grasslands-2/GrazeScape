from django.contrib import admin

# Register your models here.
from .filemodels import FileModel

admin.site.register(FileModel)
