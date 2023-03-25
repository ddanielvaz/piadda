# ros2
from rclpy.node import Node
from rosidl_runtime_py.utilities import get_message


def list_ros2_topics():
    GlobalNode = Node('abc')
    topics = []
    for t in GlobalNode.get_topic_names_and_types():
        topics.append(ROS2Topic(t))
    return topics


class ROS2Topic(object):
    def __init__(self, topic):
        self.name = topic[0]
        self.msg_types = topic[1]
        self.fields = {}
        for msg_type in self.msg_types:
            msg = get_message(msg_type)
            self.fields[self.name+msg_type] = msg.get_fields_and_field_types()


class DataChannel(object):
    def __init__(self, topic_dict):
        self.name = topic_dict.get('name')
        self.period = topic_dict.get('period')
        self.element = topic_dict.get('element_id')
        self.msg_type_str = topic_dict.get('msg_type')
        self.msg_type = get_message(self.msg_type_str)
        self.graphic = topic_dict.get('graphic_type')
        self.sub_key = self.name + str(self.msg_type) + self.graphic


class TimeSeriesChannel(DataChannel):
    def __init__(self, topic_dict):
        super().__init__(topic_dict)
        self.fields = topic_dict.get('fields')


class XYMapChannel(DataChannel):
    def __init__(self, topic_dict):
        super().__init__(topic_dict)
        self.x = topic_dict.get('x')
        self.y = topic_dict.get('y')
