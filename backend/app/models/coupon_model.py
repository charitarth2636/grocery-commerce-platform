from typing import Optional
from pydantic import Field
from app.models.base import BaseDBModel
from enum import Enum
from datetime import datetime


class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FLAT = "flat"


class CouponModel(BaseDBModel):
    """Coupon and promo code model"""

    code: str = Field(..., min_length=3, max_length=20)
    description: Optional[str] = None

    discountType: DiscountType = DiscountType.PERCENTAGE
    discountValue: float = Field(
        ..., gt=0
    )  # Either percentage (e.g., 10) or flat amount (e.g., 50)

    minOrderAmount: float = 0
    maxDiscountAmount: Optional[float] = None  # e.g., max Rs 100 off

    # Validity
    isActive: bool = True
    validFrom: Optional[datetime] = None
    validUntil: Optional[datetime] = None

    # Usage limits
    usageLimit: Optional[int] = None
    usedCount: int = 0

    class Config:
        populate_by_name = True
        enum_values = True
