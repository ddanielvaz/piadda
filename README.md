# piadda
piadda is another data dashboard attempt

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

`$ source /opt/ros2/DISTRO/setup.bash`

- Run server

`python manage.py runserver`

- Open in browser

[piadda - http://127.0.0.1:8000/](http://127.0.0.1:8000/)

# Resources
## icons
[Data Analytics](https://icons8.com/icon/LgTN0AzFZcRJ/data-analytics) icon by [Icons8](https://icons8.com).

