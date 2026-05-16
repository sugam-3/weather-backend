from django.urls import path
from . import views

urlpatterns = [
    path('api/health/', views.health_check, name='health_check'),
    path('api/weather/', views.get_weather, name='get_weather'),
    path('api/forecast/', views.get_forecast, name='get_forecast'),
]