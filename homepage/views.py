from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password,MinimumLengthValidator,CommonPasswordValidator,NumericPasswordValidator
from django.core.exceptions import (
    FieldDoesNotExist, ImproperlyConfigured, ValidationError,
)
from django.contrib.auth.decorators import login_required

from django.db.utils import IntegrityError
import traceback
from django.conf import settings
import requests
from django.shortcuts import redirect


def home(request):
    is_new_user = request.POST.get("new_user")
    user_name = "Not signed in"
    is_logged_in = "False"
    show_register = "False"
    error = ""
    validators = [MinimumLengthValidator, CommonPasswordValidator, NumericPasswordValidator]
    recaptcha_response = request.POST.get('g-recaptcha-response')
    data = {
        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
        'response': recaptcha_response
    }
    r = requests.post('https://www.google.com/recaptcha/api/siteverify',
                      data=data)
    result_cap = r.json()

    if request.method == 'POST' and request.POST.get("logout") == "True":
        print("Logging out")
        logout(request)
    elif request.user.is_authenticated:
        print("user is logged in")
        is_logged_in = "True"
        user_name = request.user.username
    else:
        if request.method == 'POST':
            # register new user
            if not result_cap:
                pass
            elif is_new_user == "True":
                print("new user")
                user_name = request.POST['username']
                password = request.POST['password']
                password2 = request.POST['password2']
                email = request.POST['email']
                show_register = "True"
                try:

                    # if User.objects.filter(username=user_name).exists():
                    #     raise ValueError("user name already exists")
                    for validator in validators:
                        validator().validate(password)
                    if password != password2:
                        raise ValueError("Passwords do not match")
                    user = User.objects.create_user(user_name,
                                                    email,
                                                    password)
                    user = authenticate(request, username=user_name,
                                        password=password)
                    print("register sucessful")
                    show_register = "False"

                    if user is not None:
                        print("logging in")
                        login(request, user)
                        is_logged_in = "True"
                        user_name = user_name
                    return redirect('/')
                except ValidationError as e:
                    error = str(e)
                except ValueError as e:
                    error = str(e)
                except IntegrityError as e:
                    error = str("User name already exists")
                except Exception as e:
                    error = str(e)
                    print(type(e).__name__)
                    traceback.print_exc()
                # check if passwords match

            # login current user
            else:
                print("current user")
                username = request.POST['username']
                password = request.POST['password']
                user = authenticate(request, username=username, password=password)
                if user is not None:
                    print("logging in")
                    login(request, user)
                    is_logged_in = "True"
                    user_name = username
                else:
                    error = "invalid username or password"
        # show register screen
        elif request.method == "GET" and request.GET.get("register"):
            print(request.GET)
            show_register = "True"


    context = {
                "user_info": {
                      "user_name": user_name,
                      "is_logged_in": is_logged_in,
                        "show_register": show_register,
                        "error": error
                      }
    }
    print(context)
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'home.html', context=context)
