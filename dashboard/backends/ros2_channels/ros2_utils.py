# ros2
from rclpy.node import Node
# project
from dashboard.backends.ros2_channels.ros2topic import ROS2Topic


def list_ros2_topics():
    temp_node = Node('abc')
    topics = []
    for t in temp_node.get_topic_names_and_types():
        topics.append(ROS2Topic(t))
    temp_node.destroy_node()
    return topics
