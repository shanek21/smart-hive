"""
A script meant to run continuously in the background of a lightweight machine (such as a Raspberry
  Pi) that listens for data published through MQTT and then stores that data into MongoDB.
"""


import os
import datetime
import paho.mqtt.client as mqtt

from pymongo import MongoClient


def on_connect(client, user_data, flags, result_code):
    """
    The callback for when the MQTT client receives a CONNACK response from the MQTT broker. This
    will only run once and is where the MQTT client subscribes to the specified topics from the MQTT
    broker.
    """
    print('MQTT client connected to MQTT broker with result code {}'.format(result_code))
    topic = '#'  # subscribe to all topics
    client.subscribe(topic)
    print('Subscribed to: \'{}\''.format(topic))


def on_message(client, user_data, msg):
    """
    The callback for when a PUBLISH message is received by the MQTT client from the MQTT broker.
    This will run each time the MQTT client receives sensor data from the MQTT broker and is where
    the recieved data is stored into the MongoDB database.
    """
    timestamp = datetime.datetime.now()  # the time that the datum was received at
    topic = msg.topic  # the topic that the datum was received from
    value = msg.payload.decode('utf-8')  # the value of the datum that was received
    datum = {'time': timestamp, 'topic': topic, 'value': value}
    result = collection.insert_one(datum)  # insert the `dataum` dictionary into the database
    # Retreive the datum that was just inserted and print it to the console of confirmation of its
    # successful insertion.
    print('Inserted datum: {}'.format(collection.find_one(result.inserted_id)))


if __name__ == '__main__':
    # Create a MongoDB client that connects to the MongoDB daemon running on a MongoDB server. The
    # MongoDB URI has the IP address of the server where we are running our MongoDB daemon, so that
    # it knows where to connect. The Herokuapp already has the MongoDB URI defined in its
    # environment variables, but if you want to run this code locally, then you will need to ask
    # for the secret MongoDB URI we use.
    mongo_client = MongoClient(host=os.environ['MONGODB_URI'])
    db = mongo_client.test_database  # use a test database for now
    collection = db.test_collection  # use a test collection for now

    # Create an MQTT client that connects to the MQTT broker running on a Raspberry Pi.
    mqtt_client = mqtt.Client()
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message
    mqtt_client.connect(host='192.168.2.100')  # the IP address of the Raspberry Pi
    mqtt_client.loop_forever()  # run a blocking loop to the MQTT broker
