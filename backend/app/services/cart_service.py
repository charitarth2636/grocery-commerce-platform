from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.services.product_service import product_service
from app.utils.response import success_response, error_response
from app.config import settings


class CartService:
    """Cart service for managing user cart"""

    @staticmethod
    async def get_or_create_cart(user_id: str) -> dict:
        """Get or create user's cart"""
        cart = await db.get_collection(COLLECTIONS["CARTS"]).find_one(
            {"userId": user_id}
        )

        if not cart:
            cart_data = {
                "userId": user_id,
                "items": [],
                "itemCount": 0,
                "subtotal": 0,
                "totalSavings": 0,
                "appliedCoupon": None,
                "couponDiscount": 0,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
            }
            result = await db.get_collection(COLLECTIONS["CARTS"]).insert_one(cart_data)
            cart = await db.get_collection(COLLECTIONS["CARTS"]).find_one(
                {"_id": result.inserted_id}
            )

        cart["id"] = str(cart.pop("_id"))
        return cart

    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int = 1) -> dict:
        """Add item to cart"""
        # Get product details
        product = await product_service.get_product_by_id(product_id)
        if not product:
            return error_response(message="Product not found")

        if not product.get("isActive", True) or not product.get("isAvailable", True):
            return error_response(message="Product is not available")

        if product.get("stockStatus") == "out_of_stock":
            return error_response(message="Product is out of stock")

        # Get or create cart
        cart = await CartService.get_or_create_cart(user_id)

        # Check if item already in cart
        existing_item = None
        for item in cart.get("items", []):
            if str(item.get("productId")) == product_id:
                existing_item = item
                break

        new_quantity = quantity
        if existing_item:
            new_quantity = existing_item.get("quantity", 0) + quantity

        # Check stock
        if new_quantity > product.get("stockQuantity", 0):
            return error_response(
                message=f"Only {product.get('stockQuantity')} items available in stock"
            )

        # Calculate item total
        selling_price = product.get("sellingPrice", 0)
        total_price = selling_price * new_quantity
        mrp = product.get("mrp", 0)
        total_mrp = mrp * new_quantity
        savings = total_mrp - total_price

        # Prepare item data
        item_data = {
            "productId": product_id,
            "productName": product.get("name"),
            "productImage": product.get("thumbnail"),
            "unit": product.get("unit"),
            "unitValue": product.get("unitValue"),
            "mrp": mrp,
            "sellingPrice": selling_price,
            "discountPercent": product.get("discountPercent", 0),
            "quantity": new_quantity,
            "totalPrice": total_price,
            "updatedAt": datetime.utcnow(),
        }

        # Update cart
        if existing_item:
            # Update existing item
            await db.get_collection(COLLECTIONS["CARTS"]).update_one(
                {"userId": user_id, "items.productId": product_id},
                {"$set": {"items.$": item_data, "updatedAt": datetime.utcnow()}},
            )
        else:
            # Add new item
            await db.get_collection(COLLECTIONS["CARTS"]).update_one(
                {"userId": user_id},
                {
                    "$push": {"items": item_data},
                    "$set": {"updatedAt": datetime.utcnow()},
                },
            )

        # Recalculate cart totals
        await CartService.recalculate_cart(user_id)

        # Get updated cart
        cart = await CartService.get_or_create_cart(user_id)

        return success_response(message="Item added to cart", data=cart)

    @staticmethod
    async def update_cart_item(user_id: str, product_id: str, quantity: int) -> dict:
        """Update cart item quantity"""
        # Get product details
        product = await product_service.get_product_by_id(product_id)
        if not product:
            return error_response(message="Product not found")

        if quantity == 0:
            # Remove item from cart
            return await CartService.remove_from_cart(user_id, product_id)

        # Check stock
        if quantity > product.get("stockQuantity", 0):
            return error_response(
                message=f"Only {product.get('stockQuantity')} items available in stock"
            )

        # Calculate item total
        selling_price = product.get("sellingPrice", 0)
        total_price = selling_price * quantity
        mrp = product.get("mrp", 0)
        total_mrp = mrp * quantity
        savings = total_mrp - total_price

        # Update item
        item_data = {
            "productId": product_id,
            "productName": product.get("name"),
            "productImage": product.get("thumbnail"),
            "unit": product.get("unit"),
            "unitValue": product.get("unitValue"),
            "mrp": mrp,
            "sellingPrice": selling_price,
            "discountPercent": product.get("discountPercent", 0),
            "quantity": quantity,
            "totalPrice": total_price,
            "updatedAt": datetime.utcnow(),
        }

        await db.get_collection(COLLECTIONS["CARTS"]).update_one(
            {"userId": user_id, "items.productId": product_id},
            {"$set": {"items.$": item_data, "updatedAt": datetime.utcnow()}},
        )

        # Recalculate cart totals
        await CartService.recalculate_cart(user_id)

        # Get updated cart
        cart = await CartService.get_or_create_cart(user_id)

        return success_response(message="Cart updated", data=cart)

    @staticmethod
    async def remove_from_cart(user_id: str, product_id: str) -> dict:
        """Remove item from cart"""
        await db.get_collection(COLLECTIONS["CARTS"]).update_one(
            {"userId": user_id},
            {
                "$pull": {"items": {"productId": product_id}},
                "$set": {"updatedAt": datetime.utcnow()},
            },
        )

        # Recalculate cart totals
        await CartService.recalculate_cart(user_id)

        # Get updated cart
        cart = await CartService.get_or_create_cart(user_id)

        return success_response(message="Item removed from cart", data=cart)

    @staticmethod
    async def clear_cart(user_id: str) -> dict:
        """Clear all items from cart"""
        await db.get_collection(COLLECTIONS["CARTS"]).update_one(
            {"userId": user_id},
            {
                "$set": {
                    "items": [],
                    "itemCount": 0,
                    "subtotal": 0,
                    "totalSavings": 0,
                    "appliedCoupon": None,
                    "couponDiscount": 0,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        return success_response(
            message="Cart cleared", data={"userId": user_id, "items": []}
        )

    @staticmethod
    async def recalculate_cart(user_id: str) -> dict:
        """Recalculate cart totals"""
        cart = await CartService.get_or_create_cart(user_id)

        items = cart.get("items", [])
        item_count = len(items)
        subtotal = sum(item.get("totalPrice", 0) for item in items)
        total_mrp = sum(item.get("mrp", 0) * item.get("quantity", 0) for item in items)
        total_savings = total_mrp - subtotal

        await db.get_collection(COLLECTIONS["CARTS"]).update_one(
            {"userId": user_id},
            {
                "$set": {
                    "itemCount": item_count,
                    "subtotal": subtotal,
                    "totalSavings": total_savings,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        return success_response()

    @staticmethod
    async def get_cart(user_id: str) -> dict:
        """Get user's cart"""
        cart = await CartService.get_or_create_cart(user_id)
        return success_response(data=cart)


cart_service = CartService()
