from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.utils.response import success_response, error_response


class AddressService:
    """Address service for managing user addresses"""

    @staticmethod
    async def get_addresses(user_id: str) -> dict:
        """Get all addresses for a user"""
        addresses = (
            await db.get_collection(COLLECTIONS["ADDRESSES"])
            .find({"userId": user_id})
            .sort("isDefault", -1)
            .to_list(length=50)
        )

        result = []
        for addr in addresses:
            addr["id"] = str(addr.pop("_id"))
            result.append(addr)

        return success_response(data=result)

    @staticmethod
    async def get_address_by_id(address_id: str, user_id: str) -> Optional[dict]:
        """Get address by ID"""
        try:
            address = await db.get_collection(COLLECTIONS["ADDRESSES"]).find_one(
                {"_id": ObjectId(address_id), "userId": user_id}
            )
            if address:
                address["id"] = str(address.pop("_id"))
            return address
        except:
            return None

    @staticmethod
    async def create_address(user_id: str, address_data: dict) -> dict:
        """Create a new address"""
        # If this is set as default, unset other defaults
        if address_data.get("isDefault"):
            await db.get_collection(COLLECTIONS["ADDRESSES"]).update_many(
                {"userId": user_id}, {"$set": {"isDefault": False}}
            )

        address = {
            "userId": user_id,
            "name": address_data.get("name"),
            "phone": address_data.get("phone"),
            "address": address_data.get("address"),
            "landmark": address_data.get("landmark"),
            "city": address_data.get("city", "Local City"),
            "state": address_data.get("state", "Local State"),
            "pincode": address_data.get("pincode"),
            "addressType": address_data.get("addressType", "home"),
            "isDefault": address_data.get("isDefault", False),
            "latitude": address_data.get("latitude"),
            "longitude": address_data.get("longitude"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        result = await db.get_collection(COLLECTIONS["ADDRESSES"]).insert_one(address)
        address["id"] = str(result.inserted_id)
        address.pop("_id", None)

        return success_response(message="Address added successfully", data=address)

    @staticmethod
    async def update_address(address_id: str, user_id: str, update_data: dict) -> dict:
        """Update an address"""
        # If setting as default, unset others
        if update_data.get("isDefault"):
            await db.get_collection(COLLECTIONS["ADDRESSES"]).update_many(
                {"userId": user_id}, {"$set": {"isDefault": False}}
            )

        update_data["updatedAt"] = datetime.utcnow()

        result = await db.get_collection(COLLECTIONS["ADDRESSES"]).update_one(
            {"_id": ObjectId(address_id), "userId": user_id}, {"$set": update_data}
        )

        if result.modified_count > 0:
            address = await AddressService.get_address_by_id(address_id, user_id)
            return success_response(
                message="Address updated successfully", data=address
            )

        return error_response(message="Address not found or no changes made")

    @staticmethod
    async def delete_address(address_id: str, user_id: str) -> dict:
        """Delete an address"""
        result = await db.get_collection(COLLECTIONS["ADDRESSES"]).delete_one(
            {"_id": ObjectId(address_id), "userId": user_id}
        )

        if result.deleted_count > 0:
            return success_response(message="Address deleted successfully")

        return error_response(message="Address not found")

    @staticmethod
    async def get_default_address(user_id: str) -> Optional[dict]:
        """Get default address for user"""
        address = await db.get_collection(COLLECTIONS["ADDRESSES"]).find_one(
            {"userId": user_id, "isDefault": True}
        )

        if address:
            address["id"] = str(address.pop("_id"))
        return address


address_service = AddressService()
