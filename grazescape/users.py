from django.contrib.auth import get_user_model

def get_users():
    User = get_user_model()
    users = User.objects.all()
    print(users)