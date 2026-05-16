from fastapi import APIRouter, Depends
from datetime import datetime
from typing import Optional
from app.middlewares.auth_middleware import get_current_user
from app.services.order_service import order_service
from app.utils.response import success_response, error_response
from app.database.mongo import db, COLLECTIONS
from bson import ObjectId

router = APIRouter(prefix="/delivery", tags=["Delivery Agent"])


def require_delivery_agent(user: dict = Depends(get_current_user)):
    """Middleware to check if user is a delivery_partner or admin"""
    if user.get("role") not in ["delivery_partner", "admin"]:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403, detail="Not authorized. Delivery agent role required."
        )
    return user


@router.get("/assigned")
async def get_assigned_orders(user: dict = Depends(require_delivery_agent)):
    """Get orders assigned to the current delivery agent"""
    agent_id = str(user["_id"])
    orders = (
        await db.get_collection(COLLECTIONS["ORDERS"])
        .find({"deliveryPartnerId": agent_id})
        .sort("createdAt", -1)
        .to_list(length=100)
    )

    result = []
    for order in orders:
        order["id"] = str(order.pop("_id"))
        result.append(order)

    return success_response(data=result)


@router.post("/orders/{order_id}/status")
async def update_delivery_status(
    order_id: str, status_data: dict, user: dict = Depends(require_delivery_agent)
):
    """Update order status (delivery agent)"""
    new_status = status_data.get("status")
    if not new_status:
        return error_response(message="Status is required")

    # Agent can only move to specific statuses like OUT_FOR_DELIVERY or DELIVERED
    if new_status not in ["out_for_delivery", "delivered", "picked_up"]:
        return error_response(
            message="Agents can only mark orders as picked_up, out_for_delivery, or delivered"
        )

    # Check if order is actually assigned to them
    order = await order_service.get_order_by_id(order_id)
    if not order:
        return error_response(message="Order not found")

    if (
        order.get("deliveryPartnerId") != str(user["_id"])
        and user.get("role") != "admin"
    ):
        return error_response(message="You can only update orders assigned to you")

    return await order_service.update_order_status(
        order_id,
        new_status,
        note=status_data.get("note"),
        otp=status_data.get("otp"),
        is_admin=False,
    )


@router.put("/status")
async def update_availability(
    status_data: dict, user: dict = Depends(require_delivery_agent)
):
    """Toggle delivery agent availability status"""
    is_available = status_data.get("isAvailable")
    if is_available is None:
        return error_response(message="isAvailable status is required")

    user_id = user["_id"]
    await db.get_collection(COLLECTIONS["USERS"]).update_one(
        {"_id": user_id},
        {"$set": {"isAvailable": is_available, "updatedAt": datetime.utcnow()}},
    )

    return success_response(
        message=f"Status updated to {'Online' if is_available else 'Offline'}",
        data={"isAvailable": is_available},
    )
