from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.cart_schema import CreateOrderSchema
from app.services.order_service import order_service
from app.middlewares.auth_middleware import get_current_user, require_admin
from app.utils.response import success_response, error_response


router = APIRouter(prefix="/orders", tags=["Orders"])


# ==================== CUSTOMER ORDER OPERATIONS ====================


@router.post("")
async def create_order(
    order: CreateOrderSchema, user: dict = Depends(get_current_user)
):
    """Create new order"""
    return await order_service.create_order(str(user["_id"]), order.model_dump())


@router.get("")
async def get_orders(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """Get user's orders"""
    return await order_service.get_orders(str(user["_id"]), status, page, limit)


# ==================== ADMIN ORDER OPERATIONS ====================


@router.post("/admin/create")
async def admin_create_order(order: dict, user: dict = Depends(require_admin)):
    """Admin manually creates an order for a user"""
    # Assuming the admin provides a userId in the order payload
    user_id = order.get("userId")
    if not user_id:
        return error_response(message="User ID is required to create an order")
    return await order_service.create_order(user_id, order)


@router.get("/admin/all")
async def get_all_orders(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: dict = Depends(require_admin),
):
    """Get all orders (admin)"""
    return await order_service.get_all_orders(status, page, limit, start_date, end_date)


# ==================== CUSTOMER ORDER OPERATIONS ====================


@router.get("/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    """Get order details"""
    is_admin = user.get("role") == "admin"
    order = await order_service.get_order_by_id(
        order_id, str(user["_id"]), is_admin=is_admin
    )
    if not order:
        return error_response(message="Order not found")
    return success_response(data=order)


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    note: Optional[str] = None,
    user: dict = Depends(require_admin),
):
    """Update order status (admin)"""
    return await order_service.update_order_status(
        order_id, status, note, is_admin=True
    )


@router.put("/{order_id}/assign")
async def assign_delivery_partner(
    order_id: str, partner_id: str, user: dict = Depends(require_admin)
):
    """Assign delivery partner to order"""
    return await order_service.assign_delivery_partner(order_id, partner_id)
