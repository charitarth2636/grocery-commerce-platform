from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.coupon_model import DiscountType


class CouponCreateSchema(BaseModel):
    code: str = Field(..., min_length=3, max_length=20)
    description: Optional[str] = None
    discountType: DiscountType
    discountValue: float = Field(..., gt=0)
    minOrderAmount: float = 0
    maxDiscountAmount: Optional[float] = None
    isActive: bool = True
    validFrom: Optional[datetime] = None
    validUntil: Optional[datetime] = None
    usageLimit: Optional[int] = None


class CouponValidateSchema(BaseModel):
    code: str
    cartTotal: float


class CouponResponseSchema(CouponCreateSchema):
    id: str
    usedCount: int

    class Config:
        from_attributes = True
