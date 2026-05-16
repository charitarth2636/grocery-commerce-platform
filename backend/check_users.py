import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

# From backend/.env
MONGODB_URL = "mongodb+srv://charitarth:0IDPTxmlqkG4LAKP@cluster0.ziyg8rc.mongodb.net/grocery_db?retryWrites=true&w=majority"
DATABASE_NAME = "grocery_db"

async def check_users():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_collection = db["users"]
    
    users = await users_collection.find().to_list(100)
    for u in users:
        print(f"User: {u.get('name')} | Email: '{u.get('email')}' | Phone: '{u.get('phone')}' | Role: {u.get('role')}")

if __name__ == "__main__":
    asyncio.run(check_users())
