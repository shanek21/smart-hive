""" An example MQTT subscriber that persists received messages in a MongoDB database. Run this file, run an MQTT broker (like mosquitto), and publish to a 'Hellos/' topic in the command line (`mosquitto_pub -h localhost -t 'Hellos/test' -m 'This is a message'`) to see the subscriber store the message, retrieve it, and print it. """


import datetime
import paho.mqtt.client as mqtt
from pymongo import MongoClient


def on_connect(client, user_data, flags, result_code):
  """ The callback for when the client receives a CONNACK response from the server. """
  print("Connected with result code " + str(result_code))
  client.subscribe("Hellos/+")


def on_message(client, user_data, msg):
  """ The callback for when a PUBLISH message is received from the broker. """
  print(msg.topic+" "+str(msg.payload))
  time_received = datetime.datetime.now()
  post = { "time": time_received, "topic": msg.topic, "value": msg.payload }
  collection.insert_one(post)
  print(collection.find_one({'topic': msg.topic}))


if __name__ == '__main__':
  # Setup MongoDB client
  mongo_client = MongoClient(host='127.0.0.1', port=27017)
  db = mongo_client.test_database
  collection = db.test_collection

  # Setup MQTT Client
  mqtt_client = mqtt.Client()
  mqtt_client.on_connect = on_connect
  mqtt_client.on_message = on_message
  mqtt_client.connect(host="127.0.0.1", port=1883, keepalive=60)

  # Run a blocking loop to the Mosquitto broker
  mqtt_client.loop_forever()
