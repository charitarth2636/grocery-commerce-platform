import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils.password import hash_password

async def create_admin():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # Check if admin exists
    admin = await db['users'].find_one({'email': 'admin@grocery.com'})
    password_hash = hash_password('admin123')
    
    if not admin:
        print('Creating admin...')
        await db['users'].insert_one({
            'name': 'Admin User',
            'email': 'admin@grocery.com',
            'phone': '0000000000',
            'password': password_hash,
            'role': 'admin',
            'isActive': True,
            'isVerified': True
        })
        print('Admin created: admin@grocery.com / admin123')
    else:
        # Update password to be sure
        await db['users'].update_one({'email': 'admin@grocery.com'}, {'$set': {'password': password_hash, 'role': 'admin'}})
        print('Admin updated: admin@grocery.com / admin123')
        
    # Also create a dummy delivery agent
    agent = await db['users'].find_one({'email': 'rider@grocery.com'})
    if not agent:
        print('Creating rider...')
        await db['users'].insert_one({
            'name': 'Test Rider',
            'email': 'rider@grocery.com',
            'phone': '8888888888',
            'password': password_hash,
            'role': 'delivery_partner',
            'isActive': True,
            'isVerified': True
        })
        print('Rider created: rider@grocery.com / admin123')
    else:
        await db['users'].update_one({'email': 'rider@grocery.com'}, {'$set': {'password': password_hash, 'role': 'delivery_partner'}})
        print('Rider updated: rider@grocery.com / admin123')

asyncio.run(create_admin())
