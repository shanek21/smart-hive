""" An example MQTT subscriber. Run this file, run an MQTT broker (like mosquitto), and publish to a 'Hellos/' topic in the command line (`mosquitto_pub -h localhost -t 'Hellos/test' -m 'This is a message'`) to see the subscriber print it. """


import paho.mqtt.client as mqtt


def on_connect(client, user_data, flags, result_code):
  """ The callback for when the client receives a CONNACK response from the server. """
  print("Connected with result code " + str(result_code))
  client.subscribe("Hellos/+")


def on_message(client, user_data, msg):
  """ The callback for when a PUBLISH message is received from the server. """
  print(msg.topic+" "+str(msg.payload))


if __name__ == '__main__':
  client = mqtt.Client()
  client.on_connect = on_connect
  client.on_message = on_message
  client.connect(host="127.0.0.1", port=1883, keepalive=60)
  client.loop_forever()
