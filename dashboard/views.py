# django
from django.shortcuts import render

# project
from dashboard.backends.ros2_channels.ros2_utils import list_ros2_topics

def dashboard(request):
    ctx = {'topics': list_ros2_topics()}
    return render(request, 'dashboard/piadda.html', ctx)
