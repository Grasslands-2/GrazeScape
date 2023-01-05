from django.db import models

class FileModel(models.Model):
    doc = models.FileField(upload_to='media/')