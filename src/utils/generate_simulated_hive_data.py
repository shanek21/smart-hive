"""
This script generates fake data from two simulated hives over the course of one year. This script
will not be used in the final iteration of the Smart Hive, but will help with starting to build
data visualizations before we have enough real data to usefully visualize.
"""


import datetime
import os
import matplotlib.pyplot as plt
import numpy as np

from pymongo import MongoClient


# Constants to use throughout this script.
SPM = 60 # number of seconds per minute
MPH = 60 # number of minutes per hour
HPD = 24 # number of hours per day
DPY = 365 # number of days per year


"""
@param h {np.ndarray} - The hours that the simulated hive 1 should have its weight measured at.
@returns {np.ndarray} - The weights of the simulated hive 1 at the specified hours. This function
  returns the sum of two sinusoids (one sinusoid where the period equals one day and one sinusoid
  where the period equals one year) plus a positive offset, so that the hive weight never goes
  below zero.
"""
def hive_1_weight_func(h):
  return np.sin((h * np.pi * 2) / HPD) + 30 * np.sin((h * np.pi * 2) / (HPD * DPY)) + 50


"""
@param h {np.ndarray} - The hours that the simulated hive 2 should have its weight measured at.
@returns {np.ndarray} - The weights of the simulated hive 2 at the specified hours. This function
  returns the sum of two sinusoids (one sinusoid where the period equals one day and one sinusoid
  where the period equals one year) plus a positive offset, so that the hive weight never goes
  below zero.
"""
def hive_2_weight_func(h):
  return np.sin((h * np.pi * 2) / HPD) + 20 * np.sin((h * np.pi * 2) / (HPD * DPY)) + 45


"""
Creates simulated weight data for two hives each hour over the course of one year. Optionally
  inserts the simulated data into MongoDB.
@param insert_to_mongodb {bool} - True to insert the simulated data into the MongoDB database.
  False to not insert the simulated data into the MongoDB database.
"""
def generate_simulated_sensor_data(insert_to_mongodb):
  # Create a MongoDB client that connects to the MongoDB daemon running on a MongoDB server. The
  #   MongoDB URI has the IP address of the server where we are running our MongoDB daemon, so that
  #   it knows where to connect. The Herokuapp already has the MongoDB URI defined in its
  #   environment variables, but if you want to run this code locally, then you will need to ask
  #   for the secret MongoDB URI we use.
  mongo_client = MongoClient(host=os.environ['MONGODB_URI'])
  db = mongo_client.test_database # use a test database for now
  collection = db.test_collection # use a test collection for now

  num_data_samples = HPD * DPY # one sample for each hour in a year
  hours = np.arange(num_data_samples) # all of the hours to sample at
  hive_1_weight_over_time = hive_1_weight_func(hours) # hive 1 weight for each hour in a year
  hive_2_weight_over_time = hive_2_weight_func(hours) # hive 2 weight for each hour in a year
  start_datetime = datetime.datetime(year=2000, month=4, day=1) # time of first simulated sample
  cur_datetime = start_datetime # current simulated time to join with our simulated weight
  dt = datetime.timedelta(0, SPM * MPH) # amount to increment `cur_datetime` between each sample

  for hive_1_weight, hive_2_weight in zip(hive_1_weight_over_time, hive_2_weight_over_time):
    hive_1_datum = { # create the dictionary to insert into MongoDB
      'timestamp': cur_datetime,
      'topic': 'hive_1/weight',
      'value': hive_1_weight
    }
    hive_2_datum = { # create the dictionary to insert into MongoDB
      'timestamp': cur_datetime,
      'topic': 'hive_2/weight',
      'value': hive_2_weight
    }
    print(hive_1_datum)
    print(hive_2_datum)

    if insert_to_mongodb:
      collection.insert_one(hive_1_datum)
      collection.insert_one(hive_2_datum)

    cur_datetime += dt # increase the current time for the next sample

  # Plot the simulated hive weights.
  plt.plot(hive_1_weight_over_time, label='Hive 1 Weight')
  plt.plot(hive_2_weight_over_time, label='Hive 2 Weight')
  plt.title('Simulated Honeybee Hive Weight Over Time')
  plt.xlabel('Time (hours)')
  plt.ylabel('Weight (pounds)')
  plt.legend()
  plt.show()


if __name__ == '__main__':
  generate_simulated_sensor_data(insert_to_mongodb=False)
