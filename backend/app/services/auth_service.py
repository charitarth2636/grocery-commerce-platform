from datetime import datetime
from typing import Optional
from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.models.user_model import UserRole
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.utils.response import error_response, success_response


class AuthService:
    """Authentication service for password-based auth (NO OTP)"""

    @staticmethod
    async def register(
        name: str, email: str, password: str, role: str = UserRole.CUSTOMER.value
    ) -> dict:
        """Register new user with email and password"""
        # Check if user exists with this email
        existing_user = await db.get_collection(COLLECTIONS["USERS"]).find_one(
            {"email": email}
        )

        if existing_user:
            return error_response(message="User with this email already exists")

        # Hash the password
        password_hash = hash_password(password)

        # Create new user
        user_data = {
            "name": name,
            "email": email,
            "phone": None,  # Phone is optional now
            "password": password_hash,
            "role": role,
            "isActive": True,
            "isVerified": True,  # Email verified by password signup
            "profileImage": None,
            "loyaltyPoints": 0,
            "totalOrders": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        result = await db.get_collection(COLLECTIONS["USERS"]).insert_one(user_data)
        user_id = result.inserted_id

        # Generate JWT token
        token_data = {"userId": str(user_id), "email": email, "role": role}
        access_token = create_access_token(token_data)

        return success_response(
            message="Account created successfully",
            data={
                "accessToken": access_token,
                "tokenType": "bearer",
                "user": {
                    "id": str(user_id),
                    "name": name,
                    "email": email,
                    "role": UserRole.CUSTOMER.value,
                    "isVerified": True,
                    "loyaltyPoints": 0,
                    "totalOrders": 0,
                },
            },
        )

    @staticmethod
    async def login(email: str, password: str) -> dict:
        """Login with email and password"""
        # Find user by email
        user = await db.get_collection(COLLECTIONS["USERS"]).find_one({"email": email})

        if not user:
            return error_response(message="Invalid email or password")

        # Verify password
        if not verify_password(password, user.get("password", "")):
            return error_response(message="Invalid email or password")

        # Check if account is active
        if not user.get("isActive", True):
            return error_response(message="Account is disabled")

        # Generate JWT token
        token_data = {
            "userId": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
        }
        access_token = create_access_token(token_data)

        return success_response(
            message="Login successful",
            data={
                "accessToken": access_token,
                "tokenType": "bearer",
                "user": {
                    "id": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "isVerified": user.get("isVerified", False),
                    "loyaltyPoints": user.get("loyaltyPoints", 0),
                    "totalOrders": user.get("totalOrders", 0),
                },
            },
        )

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[dict]:
        """Get user by ID"""
        try:
            user = await db.get_collection(COLLECTIONS["USERS"]).find_one(
                {"_id": ObjectId(user_id)}
            )
            if user:
                user["id"] = str(user.pop("_id"))
            return user
        except:
            return None

    @staticmethod
    async def update_user(user_id: str, update_data: dict) -> dict:
        """Update user profile"""
        update_data["updatedAt"] = datetime.utcnow()

        result = await db.get_collection(COLLECTIONS["USERS"]).update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )

        if result.modified_count > 0:
            return success_response(message="Profile updated successfully")
        return error_response(message="No changes made")


auth_service = AuthService()
