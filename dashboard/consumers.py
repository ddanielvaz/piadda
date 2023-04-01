# built-in
import json

# django
from channels.generic.websocket import AsyncWebsocketConsumer

# project
from dashboard.backends.ros2_channels.executor import ROS2Thread
from dashboard.backends.ros2_channels.subscribers import MapSubscriber, TimeSeriesSubscriber
from dashboard.backends.ros2_channels.channels import XYMapChannel, TimeSeriesChannel


class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.ros2 = ROS2Thread()
        self.subscribers = {}
        self.ros2.start()

    def add_subscriber(self, topic):
        graphic = topic['graphic_type']
        if graphic == 'map':
            self.add_map_subscriber(topic)
            return True
        elif graphic == 'series' or graphic == 'meter':
            self.add_time_series_subscriber(topic)
            return True
        return False

    def add_map_subscriber(self, topic_dict):
        topic = XYMapChannel(topic_dict)
        if topic.sub_key not in self.subscribers.keys():
            self.subscribers[topic.sub_key] = MapSubscriber(self, topic)
            return self.ros2.add_node(self.subscribers[topic.sub_key])
        else:
            self.subscribers[topic.sub_key].set_fields(topic.fields)

    def add_time_series_subscriber(self, topic_dict):
        topic = TimeSeriesChannel(topic_dict)
        if topic.sub_key not in self.subscribers.keys():
            self.subscribers[topic.sub_key] = TimeSeriesSubscriber(self, topic)
            return self.ros2.add_node(self.subscribers[topic.sub_key])
        else:
            self.subscribers[topic.sub_key].set_fields(topic.fields)

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        if type(text_data_json) is list:
            for data in text_data_json:
                if 'name' in data.keys():
                    st = self.add_subscriber(data)
                    # FIXME: provide response to websocket-client
                    print('Subscriber was added with sucess:', st)
                    return
        # FIXME: provide response to websocket-client
        print('Data format invalid... discarding.')

    async def disconnect(self, close_code):
        print('Disconnecting... Cleaning executors, nodes and subscribers. Close code:', close_code)
        self.ros2.stop()
        self.ros2.join(0.5)
        del self.ros2
