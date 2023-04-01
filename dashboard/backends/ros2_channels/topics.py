# ros2
from rclpy.node import Node
from rosidl_runtime_py.utilities import get_message


def list_ros2_topics():
    GlobalNode = Node('abc')
    topics = []
    for t in GlobalNode.get_topic_names_and_types():
        topics.append(ROS2Topic(t))
    return topics


class ROS2Field(object):
    def __init__(self, field, field_type, parent=None):
        self.name = field
        self.field_type = field_type
        self.children = []
        self.parent = parent
        self.process()

    def process(self):
        '''process field_type:
        1. if it is a primitive type, no children will be added.
        2. if it is a custom message, the message fields will be added.'''
        # FIXME: needs to handle sequence<MsgType>
        try:
            msg = get_message(self.field_type)
            for field, field_type in msg.get_fields_and_field_types().items():
                self.children.append(ROS2Field(field, field_type, self))
        except:
            print('Error: when decoding field:', self.name,
                  'of msg type', self.field_type)
            pass

    def get_tree_map(self):
        child_maps = []
        if self.is_leaf:
            return self.name
        for child in self.children:
            child_maps.append(child.get_tree_map())
        if self.is_root and len(child_maps) == 0:
            return {self.name: self.field_type}
        tree_map = {}
        for m in child_maps:
            tree_map['.'.join([self.name, m])] = m
        return tree_map

    @property
    def is_root(self):
        return self.parent == None

    @property
    def is_leaf(self):
        return not len(self.children) and not self.is_root

    def pretty_print(self):
        pass


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
