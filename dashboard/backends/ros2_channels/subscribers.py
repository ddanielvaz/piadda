# built-in
import asyncio
import json

# ros2
from rclpy.node import Node


class MapSubscriber(Node):
    def __init__(self, asyncws, topic):
        super().__init__('map_subscriber'+topic.node_name)
        self.ts_init = self.get_clock().now().nanoseconds
        self.websocket = asyncws
        self.topic = topic
        self.subscription = self.create_subscription(
            self.topic.msg_type, self.topic.name, self.listener_callback, 10)
        self.last_sent = 0.0

    def set_fields(self, topic):
        self.topic.x = topic.x
        self.topic.y = topic.y

    async def listener_callback(self, msg):
        # self.get_logger().info('I heard: "{}"'.format(msg))
        now = self.get_clock().now().nanoseconds
        if (now - self.last_sent)/1e9 > self.topic.period:
            ts = (now - self.ts_init)/1e9
            data = json.dumps({'element': self.topic.element,
                               'graphic_type': self.topic.graphic,
                               'ts': ts,
                               'x': eval('msg.{}'.format(self.topic.x)),
                               'y': eval('msg.{}'.format(self.topic.y))
                               })
            self.last_sent = now
            while self.websocket.mutex.locked():
                await asyncio.sleep(0.05)
            await self.websocket.threadsafe_send(data)

    def __del__(self):
        print("deleting MapSubscriber", self.topic.element)


class TimeSeriesSubscriber(Node):
    def __init__(self, asyncws, topic):
        super().__init__('time_series_subscriber'+topic.node_name)
        self.ts_init = self.get_clock().now().nanoseconds
        self.websocket = asyncws
        self.topic = topic
        self.subscription = self.create_subscription(
            self.topic.msg_type, self.topic.name, self.listener_callback, 10)
        self.set_fields(self.topic.fields)

    def set_fields(self, fields):
        self.fields = fields

    async def listener_callback(self, msg):
        # self.get_logger().info('I heard: "{}"'.format(msg))
        ts = (self.get_clock().now().nanoseconds - self.ts_init)/1e9
        for f in self.fields:
            data = json.dumps(
                {'element': self.topic.element, 'graphic_type': self.topic.graphic, 'name': f, 'ts': ts, 'value': eval('msg.{}'.format(f))})
            while self.websocket.mutex.locked():
                await asyncio.sleep(0.05)
            await self.websocket.threadsafe_send(data)

    def __del__(self):
        print("deleting TimeSeriesSubscriber", self.topic.element)
