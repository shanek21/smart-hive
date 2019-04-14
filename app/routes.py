from flask import Flask, render_template
from pymongo import MongoClient


# Setup MongoDB client
mongo_client = MongoClient(host='127.0.0.1', port=27017)
db = mongo_client.test_database
collection = db.test_collection

app = Flask(__name__)

@app.route('/')
def home():
  entries = collection.find()
  return render_template('home.html', entries=entries)


if __name__ == '__main__':
  app.config['DEBUG'] = True
  app.run()
