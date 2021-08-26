from django.shortcuts import render

def index(request):
    context = {
        "my_color": {"test1":1234}
    }
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'smartscape/index.html', context=context)

