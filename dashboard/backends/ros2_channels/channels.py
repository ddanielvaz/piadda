# ros2
from rosidl_runtime_py.utilities import get_message


class DataChannel(object):
    def __init__(self, topic_dict):
        self.name = topic_dict.get('name')
        self.period = topic_dict.get('period')
        self.element = topic_dict.get('element_id')
        self.msg_type_str = topic_dict.get('msg_type')
        self.msg_type = get_message(self.msg_type_str)
        self.graphic = topic_dict.get('graphic_type')
        self.sub_key = self.name + str(self.msg_type) + self.graphic
    
    @property
    def node_name(self):
        return self.element + self.name.replace('/', '_')


class TimeSeriesChannel(DataChannel):
    def __init__(self, topic_dict):
        super().__init__(topic_dict)
        self.fields = topic_dict.get('fields')


class XYMapChannel(DataChannel):
    def __init__(self, topic_dict):
        super().__init__(topic_dict)
        self.x = topic_dict.get('x')
        self.y = topic_dict.get('y')
