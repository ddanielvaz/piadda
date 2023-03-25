# built-in
import threading

# ros2
from rclpy.executors import SingleThreadedExecutor


class ROS2Thread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.executor = SingleThreadedExecutor()
        self.running = True

    def add_node(self, node):
        return self.executor.add_node(node)

    def run(self):
        while self.running:
            self.executor.spin_once(0.25)
        print('ROS2Thread.run finishes...')

    def stop(self):
        self.running = False

    def __del__(self):
        print("Destroying rclpy.executors.SingleThreadedExecutor")
        for node in self.executor.get_nodes():
            print("Destroying node:", node.get_name())
            node.destroy_node()
        del self.executor
