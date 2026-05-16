from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.config import settings


class Database:
    client: Optional[AsyncIOMotorClient] = None

    def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        print(f"[OK] Connected to MongoDB: {settings.DATABASE_NAME}")

    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("[INFO] Disconnected from MongoDB")

    def get_db(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        return self.client[settings.DATABASE_NAME]

    def get_collection(self, name: str):
        """Get a specific collection"""
        return self.get_db()[name]


# Global database instance
db = Database()


# Collection names
COLLECTIONS = {
    "USERS": "users",
    "PRODUCTS": "products",
    "CATEGORIES": "categories",
    "CARTS": "carts",
    "ORDERS": "orders",
    "ADDRESSES": "addresses",
    "DELIVERY_PARTNERS": "delivery_partners",
    "OTP_VERIFICATION": "otp_verification",
    "SETTINGS": "settings",
    "WISHLISTS": "wishlists",
    "REVIEWS": "reviews",
    "COUPONS": "coupons",
}
