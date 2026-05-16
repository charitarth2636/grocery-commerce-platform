from fastapi import APIRouter, Depends
from app.middlewares.auth_middleware import get_current_user
from app.services.wishlist_service import wishlist_service
from app.schemas.wishlist_schema import WishlistAddRemoveSchema

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/")
async def get_wishlist(user: dict = Depends(get_current_user)):
    return await wishlist_service.get_wishlist(str(user["_id"]))


@router.post("/toggle")
async def toggle_wishlist_item(
    data: WishlistAddRemoveSchema, user: dict = Depends(get_current_user)
):
    return await wishlist_service.toggle_item(str(user["_id"]), data.productId)
