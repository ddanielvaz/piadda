# ros 2
from rosidl_runtime_py.utilities import get_message


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
