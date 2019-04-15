"""
The main script of the Flask app. This script is run by our Herokuapp to show content on our web
  application and can also be run locally to create a local version of our web application.
"""


import os
from flask import Flask, render_template
from pymongo import MongoClient


app = Flask(__name__)

@app.route('/')
def home():
  entries = collection.find()
  return render_template('home.html', entries=entries)


if __name__ == '__main__':
  # Create a MongoDB client that connects to the MongoDB daemon running on a MongoDB server. The
  #   MongoDB URI has the IP address of the server where we are running our MongoDB daemon, so that
  #   it knows where to connect. The Herokuapp already has the MongoDB URI defined in its
  #   environment variables, but if you want to run this code locally, then you will need to ask
  #   for the secret MongoDB URI we use.
  mongo_client = MongoClient(os.environ['MONGODB_URI'])
  db = mongo_client.test_database # use a test database for now
  collection = db.test_collection # use a test collection for now

  app.config['DEBUG'] = True
  app.run() # run the Flask app
