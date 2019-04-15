# smart-hive ![](media/final/bee_icon.png)

The goal of this project is to collect, store, and visualize data about honeybee colonies. The visualization is available at [smart-hive.herokuapp.com](https://smart-hive.herokuapp.com/).

## Setup

```bash
$ sudo apt install python3.6 python3-pip
$ pip install --user pipenv
$ pipenv install
$ pipenv shell
```

## Run

1. Run the `listen_and_store.py` script, which will listen for any sensor data sent over the
   Mosquitto messaging protocol and store it in a MongoDB database. This should stay running
   continuously in a terminal.

```bash
python3 src/listen_and_store.py
```

2. Send sensor data over the Mosquitto messaging protocol. A test message can be sent with the
   following command.

```bash
mosquitto_pub -h 192.168.2.100 -t 'hive_1/weight' -m '12.5'
```

3. Visualize the contents of the sensor data in the MongoDB database by running the web application.

```bash
python3 app/routes.py
```
