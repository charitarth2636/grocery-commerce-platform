from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.utils.response import success_response, error_response
from datetime import datetime


class ReviewService:
    @staticmethod
    async def add_review(
        user_id: str, user_name: str, product_id: str, rating: float, comment: str
    ):
        # Check if user actually bought this? For now, we allow any logged in user.
        # But we must check if product exists
        product = await db.get_collection(COLLECTIONS["PRODUCTS"]).find_one(
            {"_id": ObjectId(product_id)}
        )
        if not product:
            return error_response(message="Product not found")

        # Check if already reviewed
        existing = await db.get_collection(COLLECTIONS["REVIEWS"]).find_one(
            {"userId": ObjectId(user_id), "productId": ObjectId(product_id)}
        )

        if existing:
            return error_response(message="You have already reviewed this product")

        review_data = {
            "userId": ObjectId(user_id),
            "userName": user_name,
            "productId": ObjectId(product_id),
            "rating": rating,
            "comment": comment,
            "isApproved": True,
            "createdAt": datetime.utcnow(),
        }

        await db.get_collection(COLLECTIONS["REVIEWS"]).insert_one(review_data)

        # Update product average rating
        pipeline = [
            {"$match": {"productId": ObjectId(product_id), "isApproved": True}},
            {
                "$group": {
                    "_id": "$productId",
                    "avgRating": {"$avg": "$rating"},
                    "count": {"$sum": 1},
                }
            },
        ]
        stats = (
            await db.get_collection(COLLECTIONS["REVIEWS"])
            .aggregate(pipeline)
            .to_list(1)
        )

        if stats:
            await db.get_collection(COLLECTIONS["PRODUCTS"]).update_one(
                {"_id": ObjectId(product_id)},
                {
                    "$set": {
                        "averageRating": round(stats[0]["avgRating"], 1),
                        "reviewCount": stats[0]["count"],
                    }
                },
            )

        return success_response(message="Review submitted successfully")

    @staticmethod
    async def get_product_reviews(product_id: str):
        reviews = (
            await db.get_collection(COLLECTIONS["REVIEWS"])
            .find({"productId": ObjectId(product_id), "isApproved": True})
            .sort("createdAt", -1)
            .to_list(100)
        )

        for r in reviews:
            r["id"] = str(r.pop("_id"))
            r["userId"] = str(r["userId"])
            r["productId"] = str(r["productId"])

        return success_response(data=reviews)


review_service = ReviewService()
