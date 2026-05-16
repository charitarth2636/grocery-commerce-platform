from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.utils.response import success_response, error_response
from datetime import datetime


class WishlistService:
    @staticmethod
    async def get_wishlist(user_id: str):
        wishlist = await db.get_collection(COLLECTIONS["WISHLISTS"]).find_one(
            {"userId": ObjectId(user_id)}
        )
        if not wishlist:
            # Create empty wishlist
            wishlist = {"userId": ObjectId(user_id), "productIds": []}
            await db.get_collection(COLLECTIONS["WISHLISTS"]).insert_one(wishlist)

        # Hydrate products
        product_ids = [ObjectId(pid) for pid in wishlist.get("productIds", [])]
        if product_ids:
            products = (
                await db.get_collection(COLLECTIONS["PRODUCTS"])
                .find({"_id": {"$in": product_ids}})
                .to_list(100)
            )
            for p in products:
                p["id"] = str(p.pop("_id"))
                p["categoryId"] = str(p["categoryId"])
        else:
            products = []

        return success_response(
            data={
                "products": products,
                "productIds": [str(pid) for pid in wishlist.get("productIds", [])],
            }
        )

    @staticmethod
    async def toggle_item(user_id: str, product_id: str):
        wishlist = await db.get_collection(COLLECTIONS["WISHLISTS"]).find_one(
            {"userId": ObjectId(user_id)}
        )
        if not wishlist:
            wishlist = {"userId": ObjectId(user_id), "productIds": []}
            result = await db.get_collection(COLLECTIONS["WISHLISTS"]).insert_one(
                wishlist
            )
            wishlist["_id"] = result.inserted_id

        product_obj_id = ObjectId(product_id)
        current_items = wishlist.get("productIds", [])

        if product_obj_id in current_items:
            # Remove
            await db.get_collection(COLLECTIONS["WISHLISTS"]).update_one(
                {"_id": wishlist["_id"]}, {"$pull": {"productIds": product_obj_id}}
            )
            return success_response(message="Removed from wishlist")
        else:
            # Add
            await db.get_collection(COLLECTIONS["WISHLISTS"]).update_one(
                {"_id": wishlist["_id"]}, {"$push": {"productIds": product_obj_id}}
            )
            return success_response(message="Added to wishlist")


wishlist_service = WishlistService()
