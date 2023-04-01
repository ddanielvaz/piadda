# ros2
from rosidl_runtime_py.utilities import get_message
# project
from dashboard.backends.ros2_channels.ros2field import ROS2Field


class ROS2Topic(object):
    def __init__(self, topic):
        self.name = topic[0]
        self.name_html = self.name.replace('/', '-')
        self.msg_types = topic[1]
        self.fields = []
        self.fields_tree = {}
        for msg_type in self.msg_types:
            msg = get_message(msg_type)
            msg_map = {}
            for field, field_type in msg.get_fields_and_field_types().items():
                self.fields.append(ROS2Field(field, field_type))
                msg_map.update(self.fields[-1].get_tree_map())
            self.fields_tree[self.name+msg_type] = msg_map
