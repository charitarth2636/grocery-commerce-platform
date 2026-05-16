from fastapi import APIRouter, Depends
from app.schemas.cart_schema import AddToCartSchema, UpdateCartItemSchema
from app.services.cart_service import cart_service
from app.middlewares.auth_middleware import get_current_user
from app.utils.response import success_response


router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
async def get_cart(user: dict = Depends(get_current_user)):
    """Get user's cart"""
    return await cart_service.get_cart(str(user["_id"]))


@router.post("/add")
async def add_to_cart(item: AddToCartSchema, user: dict = Depends(get_current_user)):
    """Add item to cart"""
    return await cart_service.add_to_cart(
        str(user["_id"]), item.productId, item.quantity
    )


@router.put("/items/{product_id}")
async def update_cart_item(
    product_id: str, item: UpdateCartItemSchema, user: dict = Depends(get_current_user)
):
    """Update cart item quantity"""
    return await cart_service.update_cart_item(
        str(user["_id"]), product_id, item.quantity
    )


@router.delete("/items/{product_id}")
async def remove_from_cart(product_id: str, user: dict = Depends(get_current_user)):
    """Remove item from cart"""
    return await cart_service.remove_from_cart(str(user["_id"]), product_id)


@router.delete("/clear")
async def clear_cart(user: dict = Depends(get_current_user)):
    """Clear cart"""
    return await cart_service.clear_cart(str(user["_id"]))
