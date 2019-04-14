"""
An example MQTT subscriber that persists received messages in a MongoDB database. Run this file,
  run an MQTT broker (like mosquitto), and publish to a 'Hellos/' topic in the command line
  (`mosquitto_pub -h localhost -t 'Hellos/test' -m 'This is a message'`) to see the subscriber
  store the message, retrieve it, and print it.
"""


import datetime
import paho.mqtt.client as mqtt

from pymongo import MongoClient


"""
The callback for when the client receives a CONNACK response from the server.
"""
def on_connect(client, user_data, flags, result_code):
  print('Connected with result code {}'.format(str(result_code)))
  client.subscribe('hive_1/temperature')
  client.subscribe('hive_1/humidity')
  client.subscribe('hive_1/weight')
  client.subscribe('hive_2/temperature')
  client.subscribe('hive_2/humidity')
  client.subscribe('hive_2/weight')


"""
The callback for when a PUBLISH message is received from the broker.
"""
def on_message(client, user_data, msg):
  print('{}: {}'.format(msg.topic, msg.payload.decode('utf-8')))
  time_received = datetime.datetime.now()
  entry = {'time': time_received, 'topic': msg.topic, 'value': msg.payload.decode('utf-8')}
  collection.insert_one(entry)
  print(collection.find_one({'time': time_received}))


if __name__ == '__main__':
  # Setup MongoDB client
  mongo_client = MongoClient(host='127.0.0.1', port=27017)
  db = mongo_client.test_database
  collection = db.test_collection

  # Setup MQTT Client
  mqtt_client = mqtt.Client()
  mqtt_client.on_connect = on_connect
  mqtt_client.on_message = on_message
  mqtt_client.connect(host='127.0.0.1', port=1883, keepalive=60)

  # Run a blocking loop to the Mosquitto broker
  mqtt_client.loop_forever()
