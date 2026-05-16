from app.database.mongo import db, COLLECTIONS
from app.utils.response import success_response
from bson import ObjectId


class AdminService:
    @staticmethod
    async def get_analytics():
        # Total Orders & Revenue
        order_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "totalOrders": {"$sum": 1},
                    "totalRevenue": {"$sum": "$totalAmount"},
                }
            }
        ]
        order_stats = (
            await db.get_collection(COLLECTIONS["ORDERS"])
            .aggregate(order_pipeline)
            .to_list(1)
        )

        metrics = {
            "totalOrders": order_stats[0]["totalOrders"] if order_stats else 0,
            "totalRevenue": order_stats[0]["totalRevenue"] if order_stats else 0,
            "totalUsers": await db.get_collection(COLLECTIONS["USERS"]).count_documents(
                {"role": "customer"}
            ),
            "totalProducts": await db.get_collection(
                COLLECTIONS["PRODUCTS"]
            ).count_documents({}),
            "lowStockProducts": await db.get_collection(
                COLLECTIONS["PRODUCTS"]
            ).count_documents({"stockQuantity": {"$lte": 10}}),
        }

        # Recent Orders
        recent_orders = (
            await db.get_collection(COLLECTIONS["ORDERS"])
            .find()
            .sort("createdAt", -1)
            .limit(5)
            .to_list(5)
        )
        for order in recent_orders:
            order["id"] = str(order.pop("_id"))
            order["userId"] = str(order["userId"])

        return success_response(
            data={"metrics": metrics, "recentOrders": recent_orders}
        )

    @staticmethod
    async def get_users(role: str = "customer"):
        query = {"isDeleted": {"$ne": True}}
        if role != "all":
            query["role"] = role

        users = (
            await db.get_collection(COLLECTIONS["USERS"])
            .find(query)
            .sort("createdAt", -1)
            .to_list(100)
        )
        for u in users:
            u["id"] = str(u.pop("_id"))
            u.pop("password", None)
        return success_response(data=users)

    @staticmethod
    async def create_rider(rider_data: dict):
        from app.utils.password import hash_password
        from datetime import datetime

        # Check if user already exists
        existing_user = await db.get_collection(COLLECTIONS["USERS"]).find_one(
            {
                "$or": [
                    {"phone": rider_data.get("phone")},
                    {"email": rider_data.get("email")},
                ]
            }
        )

        if existing_user:
            if existing_user.get("role") == "admin":
                return {
                    "success": False,
                    "message": "User is an administrator and cannot be made a rider",
                }

            if existing_user.get("role") == "delivery_partner":
                return {
                    "success": False,
                    "message": "User is already registered as a delivery partner",
                }

            # If user is a customer, promote to rider
            update_data = {
                "name": rider_data.get("name", existing_user.get("name")),
                "role": "delivery_partner",
                "vehicleType": rider_data.get("vehicleType", "bike"),
                "isActive": True,
                "isAvailable": False,
                "updatedAt": datetime.utcnow(),
            }

            # Update password if provided
            if rider_data.get("password"):
                update_data["password"] = hash_password(rider_data["password"])

            # Initialize rider stats if not present
            if "totalOrders" not in existing_user:
                update_data["totalOrders"] = 0
            if "earnings" not in existing_user:
                update_data["earnings"] = 0

            await db.get_collection(COLLECTIONS["USERS"]).update_one(
                {"_id": existing_user["_id"]}, {"$set": update_data}
            )

            # Fetch updated user for response
            updated_user = await db.get_collection(COLLECTIONS["USERS"]).find_one(
                {"_id": existing_user["_id"]}
            )
            updated_user["id"] = str(updated_user.pop("_id"))
            updated_user.pop("password", None)

            return success_response(
                data=updated_user,
                message="User promoted to delivery partner successfully",
            )

        # Create brand new rider
        rider = {
            "name": rider_data["name"],
            "email": rider_data["email"],
            "phone": rider_data["phone"],
            "password": hash_password(rider_data["password"]),
            "role": "delivery_partner",
            "vehicleType": rider_data.get("vehicleType", "bike"),
            "isActive": True,
            "isAvailable": False,
            "totalOrders": 0,
            "earnings": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        result = await db.get_collection(COLLECTIONS["USERS"]).insert_one(rider)
        rider["id"] = str(result.inserted_id)
        rider.pop("password")
        return success_response(data=rider, message="Rider created successfully")

    @staticmethod
    async def update_rider(rider_id: str, update_data: dict):
        from datetime import datetime
        from app.utils.password import hash_password

        if "password" in update_data:
            update_data["password"] = hash_password(update_data["password"])

        update_data["updatedAt"] = datetime.utcnow()

        result = await db.get_collection(COLLECTIONS["USERS"]).update_one(
            {"_id": ObjectId(rider_id)}, {"$set": update_data}
        )

        if result.modified_count > 0:
            return success_response(message="Rider updated successfully")
        return {"success": False, "message": "No changes made or rider not found"}

    @staticmethod
    async def update_user_status(user_id: str, status_data: dict):
        from datetime import datetime

        update_data = {"updatedAt": datetime.utcnow()}

        if "isActive" in status_data:
            update_data["isActive"] = status_data["isActive"]
        if "isBlocked" in status_data:
            update_data["isBlocked"] = status_data["isBlocked"]

        result = await db.get_collection(COLLECTIONS["USERS"]).update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )

        if result.modified_count > 0:
            return success_response(message="User status updated successfully")
        return {"success": False, "message": "User not found or no changes made"}

    @staticmethod
    async def delete_user(user_id: str):
        from datetime import datetime

        # Soft delete instead of physical deletion
        result = await db.get_collection(COLLECTIONS["USERS"]).update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "isDeleted": True,
                    "isActive": False,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )
        if result.modified_count > 0:
            return success_response(message="User deleted successfully")
        return {"success": False, "message": "User not found"}

    @staticmethod
    async def get_settings():
        settings_doc = await db.get_collection("settings").find_one({"type": "global"})
        if not settings_doc:
            # Default settings
            default_settings = {
                "type": "global",
                "deliveryCharge": 40,
                "freeDeliveryThreshold": 500,
                "storePickupEnabled": True,
            }
            await db.get_collection("settings").insert_one(default_settings)
            settings_doc = default_settings

        settings_doc["id"] = str(settings_doc.pop("_id"))
        return success_response(data=settings_doc)

    @staticmethod
    async def update_settings(update_data: dict):
        # Prevent type from being changed
        update_data.pop("type", None)
        update_data.pop("id", None)

        await db.get_collection("settings").update_one(
            {"type": "global"}, {"$set": update_data}, upsert=True
        )
        return success_response(message="Settings updated successfully")


admin_service = AdminService()
