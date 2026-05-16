from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.utils.response import success_response, error_response
from datetime import datetime


class CouponService:
    @staticmethod
    async def create_coupon(data: dict):
        # Convert valid dates if present
        data["code"] = data["code"].upper()

        for date_field in ["validFrom", "validUntil"]:
            if data.get(date_field) and isinstance(data[date_field], str):
                try:
                    # Handle ISO strings ending with Z
                    date_str = data[date_field].replace("Z", "+00:00")
                    data[date_field] = datetime.fromisoformat(date_str).replace(
                        tzinfo=None
                    )
                except ValueError:
                    pass

        existing = await db.get_collection(COLLECTIONS["COUPONS"]).find_one(
            {"code": data["code"]}
        )
        if existing:
            return error_response(message="Coupon code already exists")

        data["createdAt"] = datetime.utcnow()
        data["usedCount"] = 0

        result = await db.get_collection(COLLECTIONS["COUPONS"]).insert_one(data)
        return success_response(
            message="Coupon created successfully", data={"id": str(result.inserted_id)}
        )

    @staticmethod
    async def validate_coupon(code: str, cart_total: float):
        coupon = await db.get_collection(COLLECTIONS["COUPONS"]).find_one(
            {"code": code.upper(), "isActive": True}
        )

        if not coupon:
            return error_response(message="Invalid or expired coupon code")

        now = datetime.utcnow()

        if coupon.get("validFrom") and coupon["validFrom"] > now:
            return error_response(message="Coupon is not yet active")

        if coupon.get("validUntil") and coupon["validUntil"] < now:
            return error_response(message="Coupon has expired")

        if coupon.get("usageLimit") and coupon["usedCount"] >= coupon["usageLimit"]:
            return error_response(message="Coupon usage limit reached")

        if cart_total < coupon.get("minOrderAmount", 0):
            return error_response(
                message=f"Minimum order amount of ₹{coupon['minOrderAmount']} required"
            )

        # Calculate discount
        discount_amount = 0
        if coupon["discountType"] == "flat":
            discount_amount = coupon["discountValue"]
        elif coupon["discountType"] == "percentage":
            discount_amount = (cart_total * coupon["discountValue"]) / 100

        if (
            coupon.get("maxDiscountAmount")
            and discount_amount > coupon["maxDiscountAmount"]
        ):
            discount_amount = coupon["maxDiscountAmount"]

        # Ensure discount doesn't exceed total
        discount_amount = min(discount_amount, cart_total)

        return success_response(
            data={
                "code": coupon["code"],
                "discountAmount": round(discount_amount, 2),
                "description": coupon.get(
                    "description", f"{coupon['discountValue']}% Off"
                ),
            }
        )

    @staticmethod
    async def get_all_coupons():
        coupons = (
            await db.get_collection(COLLECTIONS["COUPONS"])
            .find()
            .sort("createdAt", -1)
            .to_list(100)
        )
        for c in coupons:
            c["id"] = str(c.pop("_id"))
        return success_response(data=coupons)

    @staticmethod
    async def get_coupon_by_id(coupon_id: str):
        coupon = await db.get_collection(COLLECTIONS["COUPONS"]).find_one(
            {"_id": ObjectId(coupon_id)}
        )
        if coupon:
            coupon["id"] = str(coupon.pop("_id"))
        return success_response(data=coupon)

    @staticmethod
    async def update_coupon(coupon_id: str, update_data: dict):
        if "code" in update_data:
            update_data["code"] = update_data["code"].upper()

        for date_field in ["validFrom", "validUntil"]:
            if update_data.get(date_field) and isinstance(update_data[date_field], str):
                try:
                    # Handle ISO strings ending with Z
                    date_str = update_data[date_field].replace("Z", "+00:00")
                    update_data[date_field] = datetime.fromisoformat(date_str).replace(
                        tzinfo=None
                    )
                except ValueError:
                    pass

        update_data["updatedAt"] = datetime.utcnow()

        result = await db.get_collection(COLLECTIONS["COUPONS"]).update_one(
            {"_id": ObjectId(coupon_id)}, {"$set": update_data}
        )

        if result.modified_count > 0:
            return success_response(message="Coupon updated successfully")
        return error_response(message="No changes made")

    @staticmethod
    async def delete_coupon(coupon_id: str):
        result = await db.get_collection(COLLECTIONS["COUPONS"]).delete_one(
            {"_id": ObjectId(coupon_id)}
        )
        if result.deleted_count > 0:
            return success_response(message="Coupon deleted successfully")
        return error_response(message="Coupon not found")


coupon_service = CouponService()
