from django.urls import path
from . import views

urlpatterns = [
    path('submit', views.submit_admission),
    path('contact-submit', views.submit_contact),
    path('api/login', views.candidate_login),
]