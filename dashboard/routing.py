from django.urls import path
from dashboard.consumers import DashboardConsumer

ws_urlpatterns = [
    path('ws/dashboard_data/', DashboardConsumer.as_asgi())
]