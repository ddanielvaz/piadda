# piadda
piadda is another data dashboard attempt

The main goal is allow visualizing data from ROS2 nodes, in mobile devices or client machines that do not have ROS2 local installation.

The piadda serves a web-application that runs in a device that should have access to ROS2 nodes.

The data could be visualized connecting to device's IP from a web browser.

The client-side do not need ROS2 local installation, because piadda provides an abstraction layer using django-channels (websockets) in order to streaming data from ros2-end-device to client-browser.

The piadda is similar to [PlotJuggler](https://github.com/facontidavide/PlotJuggler) but providing a web interface to data visualization.

# Dependencies
- channels
- daphne
- django
- ros2 - rclpy

# Running
- Install venv.

`$ pip install virtualenv`

- Create a new virtualenv directory

`$ virtualenv piadda_pyenv`

- Source the piadda_pyenv

`$ source <PATH-TO>/piadda_pyenv/bin/activate`

- Clone the piadda repository and navigate to repository local path - don't need to be inside piadda_pyenv path.

`$ cd <PATH-TO>/piadda/`

- Install requirements in piadda_pyenv

`$ pip install -r requirements.txt`

- Source the ros2 installation - where DISTRO could be foxy, galactic, rolling, humble and so on...

`$ source /opt/ros/DISTRO/setup.bash`

- Run server

`python manage.py runserver`

- Open in browser

[piadda - http://127.0.0.1:8000/](http://127.0.0.1:8000/)

# Examples

[Turtlesim example](https://github.com/ddanielvaz/piadda/wiki/TurtlesimExample)

![output](https://user-images.githubusercontent.com/4839159/233868740-722e152a-681a-4d69-9ee6-4b51625e2a71.gif)

# Resources

## Wiki

[Wiki](https://github.com/ddanielvaz/piadda/wiki/)

## icons

[Data Analytics](https://icons8.com/icon/LgTN0AzFZcRJ/data-analytics) icon by [Icons8](https://icons8.com).
