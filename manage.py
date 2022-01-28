#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    #set DJANGO_SETTINGS_MODULE=grassland.settings.settings_prod
    #set DJANGO_SETTINGS_MODULE=grassland.settings.settings_dev
    #set GOOGLE_APPLICATION_CREDENTIALS=grassland.calsgrazescapefiles63e6b1043d3d1bc0
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'grassland.settings.settings_dev')
    #os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'grassland.settings.settings_prod')
    #os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'grassland.settings.settings_local')
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "\grassland\settings\gcskeyGS.json"
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
