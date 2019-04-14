from pymongo import MongoClient


if __name__ == '__main__':
  # Setup MongoDB client
  mongo_client = MongoClient(host='127.0.0.1', port=27017)
  db = mongo_client.test

  # db.inventory.insert_one({"item": "canvas",
  #   "qty": 100,
  #   "tags": ["cotton"],
  #   "size": {"h": 28, "w": 35.5, "uom": "cm"}})

  cursor = db.inventory.find({})

  for i in cursor:
    print(i)
