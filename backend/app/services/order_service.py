import random
from datetime import datetime, timedelta
from typing import Optional, List
from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.services.cart_service import cart_service
from app.services.product_service import product_service
from app.services.coupon_service import coupon_service
from app.utils.response import success_response, error_response
from app.utils.password import generate_order_number
from app.config import settings
from app.models.order_model import (
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    DeliveryType,
)


class OrderService:
    """Order service for managing orders"""

    @staticmethod
    async def create_order(user_id: str, order_data: dict) -> dict:
        """Create a new order from cart"""
        # Get user
        user = await db.get_collection(COLLECTIONS["USERS"]).find_one(
            {"_id": ObjectId(user_id)}
        )
        if not user:
            return error_response(message="User not found")

        # Get cart
        cart_response = await cart_service.get_cart(user_id)
        cart = cart_response.get("data", {})
        items = cart.get("items", [])

        if not items:
            return error_response(message="Cart is empty")

        # Validate minimum order amount
        subtotal = cart.get("subtotal", 0)
        if subtotal < settings.MIN_ORDER_AMOUNT:
            return error_response(
                message=f"Minimum order amount is ₹{settings.MIN_ORDER_AMOUNT}. Current: ₹{subtotal}"
            )

        # Validate delivery type and address
        delivery_type = order_data.get("deliveryType", "delivery")
        delivery_address = order_data.get("deliveryAddress")

        if delivery_type == DeliveryType.DELIVERY.value:
            if not delivery_address:
                return error_response(message="Delivery address is required")

        # Build order items
        order_items = []
        item_count = 0
        total_mrp = 0
        total_selling = 0

        for item in items:
            # Get latest product details for stock validation
            product = await product_service.get_product_by_id(item.get("productId"))
            if not product or not product.get("isActive"):
                return error_response(
                    message=f"Product {item.get('productName')} is no longer available"
                )

            if not product.get("isAvailable"):
                return error_response(
                    message=f"Product {item.get('productName')} is currently unavailable"
                )

            qty = item.get("quantity", 0)
            if qty > product.get("stockQuantity", 0):
                return error_response(
                    message=f"Insufficient stock for {item.get('productName')}. Available: {product.get('stockQuantity')}"
                )

            item_total = product.get("sellingPrice", 0) * qty
            item_mrp = product.get("mrp", 0) * qty
            item_savings = item_mrp - item_total

            order_item = {
                "productId": item.get("productId"),
                "productName": product.get("name"),
                "productImage": product.get("thumbnail"),
                "mrp": product.get("mrp"),
                "sellingPrice": product.get("sellingPrice"),
                "discountPercent": product.get("discountPercent", 0),
                "quantity": qty,
                "unit": product.get("unit"),
                "unitValue": product.get("unitValue"),
                "totalPrice": item_total,
                "totalMrp": item_mrp,
                "savings": item_savings,
                "isAvailable": True,
                "note": item.get("note"),
                "createdAt": datetime.utcnow(),
            }
            order_items.append(order_item)
            item_count += qty
            total_mrp += item_mrp
            total_selling += item_total

        # Calculate delivery charge from dynamic settings
        admin_settings_doc = await db.get_collection("settings").find_one(
            {"type": "global"}
        )
        if admin_settings_doc:
            dyn_threshold = admin_settings_doc.get(
                "freeDeliveryThreshold", settings.FREE_DELIVERY_THRESHOLD
            )
            dyn_charge = admin_settings_doc.get(
                "deliveryCharge", settings.DELIVERY_CHARGE
            )
        else:
            dyn_threshold = settings.FREE_DELIVERY_THRESHOLD
            dyn_charge = settings.DELIVERY_CHARGE

        delivery_charge = 0
        if delivery_type == DeliveryType.DELIVERY.value:
            if subtotal < dyn_threshold:
                delivery_charge = dyn_charge

        # Validate Pincode (Mock simple check)
        if delivery_address and delivery_address.get("pincode"):
            valid_pincodes_mock = [
                "110001",
                "110002",
                "110003",
                "400001",
                "400002",
                "560001",
                "560002",
            ]
            # In a real app, query a DB collection. For now, allow all or mock.
            pass

        # Calculate totals
        item_savings = total_mrp - total_selling

        # Handle Coupon
        coupon_discount = cart.get("couponDiscount", 0)
        coupon_code_applied = cart.get("appliedCoupon")

        # If passed from checkout frontend instead of cart explicitly
        if order_data.get("couponCode") and not coupon_code_applied:
            coupon_res = await coupon_service.validate_coupon(
                order_data.get("couponCode"), total_selling
            )
            if coupon_res.get("success"):
                coupon_discount = coupon_res["data"]["discountAmount"]
                coupon_code_applied = coupon_res["data"]["code"]
                # Increment coupon usage
                await db.get_collection(COLLECTIONS["COUPONS"]).update_one(
                    {"code": coupon_code_applied}, {"$inc": {"usedCount": 1}}
                )

        total_amount = total_selling + delivery_charge - coupon_discount

        # Prepare order
        order = {
            "userId": user_id,
            "userName": user.get("name"),
            "userPhone": user.get("phone"),
            "orderNumber": generate_order_number(),
            "items": order_items,
            "itemCount": item_count,
            "subtotal": total_selling,
            "itemSavings": item_savings,
            "deliveryCharge": delivery_charge,
            "couponCode": coupon_code_applied,
            "couponDiscount": coupon_discount,
            "totalAmount": total_amount,
            "deliveryType": delivery_type,
            "timeline": [
                {"status": OrderStatus.PENDING.value, "timestamp": datetime.utcnow()}
            ],
            "orderStatus": OrderStatus.PENDING.value,
            "paymentMethod": order_data.get("paymentMethod", PaymentMethod.COD.value),
            "paymentStatus": PaymentStatus.PENDING.value,
            "otp": str(random.randint(1000, 9999)),
            "specialInstructions": order_data.get("specialInstructions"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        # Add delivery address if delivery type
        if delivery_type == DeliveryType.DELIVERY.value and delivery_address:
            order["deliveryAddress"] = delivery_address

        # Add time slot if provided
        if order_data.get("timeSlot"):
            order["timeSlot"] = order_data.get("timeSlot")

        # Insert order
        result = await db.get_collection(COLLECTIONS["ORDERS"]).insert_one(order)
        order["id"] = str(result.inserted_id)
        order.pop("_id", None)

        # Update product stock
        for item in items:
            await product_service.update_stock(
                item.get("productId"), -item.get("quantity", 0)
            )

        # Update user order count
        await db.get_collection(COLLECTIONS["USERS"]).update_one(
            {"_id": ObjectId(user_id)}, {"$inc": {"totalOrders": 1}}
        )

        # Clear cart after successful order
        await cart_service.clear_cart(user_id)

        return success_response(message="Order placed successfully", data=order)

    @staticmethod
    async def get_orders(
        user_id: str, status: Optional[str] = None, page: int = 1, limit: int = 20
    ) -> dict:
        """Get user's orders"""
        query = {"userId": user_id}

        if status:
            query["orderStatus"] = status

        # Get total count
        total = await db.get_collection(COLLECTIONS["ORDERS"]).count_documents(query)

        # Get orders
        orders = (
            await db.get_collection(COLLECTIONS["ORDERS"])
            .find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("createdAt", -1)
            .to_list(length=limit)
        )

        result = []
        for order in orders:
            order["id"] = str(order.pop("_id"))
            result.append(order)

        return {
            "success": True,
            "data": result,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    @staticmethod
    async def get_order_by_id(
        order_id: str, user_id: str = None, is_admin: bool = False
    ) -> Optional[dict]:
        """Get order by ID"""
        try:
            query = {"_id": ObjectId(order_id)}
            if user_id and not is_admin:
                query["userId"] = user_id

            order = await db.get_collection(COLLECTIONS["ORDERS"]).find_one(query)
            if order:
                order["id"] = str(order.pop("_id"))
            return order
        except:
            return None

    @staticmethod
    async def get_order_by_number(
        order_number: str, user_id: str = None
    ) -> Optional[dict]:
        """Get order by order number"""
        query = {"orderNumber": order_number}
        if user_id:
            query["userId"] = user_id

        order = await db.get_collection(COLLECTIONS["ORDERS"]).find_one(query)
        if order:
            order["id"] = str(order.pop("_id"))
        return order

    @staticmethod
    async def cancel_order(order_id: str, user_id: str, reason: str = None) -> dict:
        """Cancel an order"""
        order = await OrderService.get_order_by_id(order_id, user_id)

        if not order:
            return error_response(message="Order not found")

        # Check if order can be cancelled
        if order["orderStatus"] in [
            OrderStatus.DELIVERED.value,
            OrderStatus.CANCELLED.value,
        ]:
            return error_response(message="Order cannot be cancelled")

        # Update order status
        await db.get_collection(COLLECTIONS["ORDERS"]).update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "orderStatus": OrderStatus.CANCELLED.value,
                    "cancelledAt": datetime.utcnow(),
                    "cancelledBy": "user",
                    "cancellationReason": reason,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        # Restore stock
        for item in order.get("items", []):
            await product_service.update_stock(
                item.get("productId"), item.get("quantity", 0)
            )

        return success_response(message="Order cancelled successfully")

    # ==================== ADMIN ORDER OPERATIONS ====================

    @staticmethod
    async def get_all_orders(
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> dict:
        """Get all orders (admin)"""
        query = {}

        if status:
            query["orderStatus"] = status

        # Date filter
        if start_date or end_date:
            query["createdAt"] = {}
            if start_date:
                query["createdAt"]["$gte"] = datetime.fromisoformat(start_date)
            if end_date:
                query["createdAt"]["$lte"] = datetime.fromisoformat(end_date)

        # Get total count
        total = await db.get_collection(COLLECTIONS["ORDERS"]).count_documents(query)

        # Get orders
        orders = (
            await db.get_collection(COLLECTIONS["ORDERS"])
            .find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("createdAt", -1)
            .to_list(length=limit)
        )

        result = []
        for order in orders:
            order["id"] = str(order.pop("_id"))
            result.append(order)

        return {
            "success": True,
            "data": result,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    @staticmethod
    async def update_order_status(
        order_id: str,
        status: str,
        note: str = None,
        otp: str = None,
        is_admin: bool = False,
    ) -> dict:
        """Update order status (admin or rider)"""
        valid_statuses = [s.value for s in OrderStatus]
        if status not in valid_statuses:
            return error_response(message=f"Invalid status. Valid: {valid_statuses}")

        order = await OrderService.get_order_by_id(order_id)
        if not order:
            return error_response(message="Order not found")

        # OTP verification for delivery partners
        if status == OrderStatus.DELIVERED.value and not is_admin:
            if not otp:
                return error_response(message="OTP is required for delivery completion")
            if order.get("otp") != otp:
                return error_response(
                    message="Invalid OTP. Please check with the customer."
                )

        # Update status
        update_data = {"orderStatus": status, "updatedAt": datetime.utcnow()}

        # Set timestamps based on status
        if status == OrderStatus.ACCEPTED.value:
            update_data["acceptedAt"] = datetime.utcnow()
        elif status == OrderStatus.PREPARING.value:
            update_data["preparingAt"] = datetime.utcnow()
        elif status == OrderStatus.PICKED_UP.value:
            update_data["pickedUpAt"] = datetime.utcnow()
        elif status == OrderStatus.OUT_FOR_DELIVERY.value:
            update_data["outForDeliveryAt"] = datetime.utcnow()
        elif status == OrderStatus.DELIVERED.value:
            update_data["deliveredAt"] = datetime.utcnow()

            # Credit rider commission and update stats
            partner_id = order.get("deliveryPartnerId")
            if partner_id:
                try:
                    await db.get_collection(COLLECTIONS["USERS"]).update_one(
                        {"_id": ObjectId(partner_id)},
                        {"$inc": {"earnings": 25, "totalOrders": 1}},
                    )
                except:
                    pass
        elif status == OrderStatus.CANCELLED.value:
            update_data["cancelledAt"] = datetime.utcnow()
            # Restore stock on cancellation
            for item in order.get("items", []):
                await product_service.update_stock(
                    item.get("productId"), item.get("quantity", 0)
                )

        if note:
            update_data["adminNote"] = note

        # Append to timeline
        timeline_entry = {
            "status": status,
            "timestamp": datetime.utcnow(),
            "note": note,
        }

        await db.get_collection(COLLECTIONS["ORDERS"]).update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data, "$push": {"timeline": timeline_entry}},
        )

        # Broadcast via WebSocket
        from app.services.websocket_service import ws_manager
        
        # Get latest order state to broadcast
        updated_order = await OrderService.get_order_by_id(order_id)
        if updated_order:
            await ws_manager.broadcast_order_update(order_id, {
                "type": "status_update",
                "orderStatus": status,
                "order": updated_order
            })

        return success_response(message=f"Order status updated to {status}")

    @staticmethod
    async def assign_delivery_partner(order_id: str, partner_id: str) -> dict:
        """Assign delivery partner to order (Sets status to ASSIGNED)"""
        partner = await db.get_collection(COLLECTIONS["USERS"]).find_one(
            {"_id": ObjectId(partner_id), "role": "delivery_partner"}
        )
        if not partner:
            return error_response(message="Delivery partner not found")

        await db.get_collection(COLLECTIONS["ORDERS"]).update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "deliveryPartnerId": partner_id,
                    "deliveryPartnerName": partner.get("name"),
                    "deliveryPartnerPhone": partner.get("phone"),
                    "orderStatus": OrderStatus.ASSIGNED.value,
                    "assignedAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow(),
                },
                "$push": {
                    "timeline": {
                        "status": OrderStatus.ASSIGNED.value,
                        "timestamp": datetime.utcnow(),
                        "note": "Rider assigned by admin",
                    }
                },
            },
        )

        from app.services.websocket_service import ws_manager
        updated_order = await OrderService.get_order_by_id(order_id)
        if updated_order:
            await ws_manager.broadcast_order_update(order_id, {
                "type": "rider_assigned",
                "orderStatus": OrderStatus.ASSIGNED.value,
                "order": updated_order
            })

        return success_response(message="Delivery partner assigned")


order_service = OrderService()
