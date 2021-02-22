from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.


def index(request):
    print("hello world")
    context = {
        'num_books': "d",
        'num_instances': "d",
        'num_instances_available': "d",
        'num_authors': "d",
    }

    # Render the HTML template index.html with the data in the context variable
    return render(request, 'index.html', context=context)
