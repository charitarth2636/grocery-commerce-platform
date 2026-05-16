from fastapi import APIRouter, Depends
from app.services.coupon_service import coupon_service
from app.schemas.coupon_schema import CouponValidateSchema
from app.middlewares.auth_middleware import get_current_user

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.post("/validate")
async def validate_coupon(
    data: CouponValidateSchema, user: dict = Depends(get_current_user)
):
    # User dependency ensures they are logged in.
    return await coupon_service.validate_coupon(data.code, data.cartTotal)
