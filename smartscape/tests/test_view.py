from django.test import Client
# https://docs.djangoproject.com/en/3.2/topics/testing/tools/
c = Client()
response = c.post('/login/', {'username': 'john', 'password': 'smith'})
print(response.status_code)
response = c.get('/customer/details/')
print(response.content)