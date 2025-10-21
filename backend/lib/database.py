from pymongo import MongoClient
import os

# Create a single, shared MongoClient instance
try:
    mongo_uri = os.getenv("MONGO_DETAILS")
    if not mongo_uri:
        raise ValueError("MONGO_DETAILS environment variable not set")
    
    client = MongoClient(mongo_uri)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("Successfully connected to MongoDB.")
    db = client["calories-quest"]
except Exception as e:
    print(f"FATAL: Could not connect to MongoDB: {e}")
    client = None
    db = None

def get_db():
    """
    Returns the application's database instance.
    """
    if db is None:
        raise Exception("Database is not connected.")
    return db