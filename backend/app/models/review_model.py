from typing import Optional
from pydantic import Field
from app.models.base import BaseDBModel, PyObjectId


class ReviewModel(BaseDBModel):
    """Product review model"""

    productId: PyObjectId
    userId: PyObjectId
    userName: str

    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None

    # Moderation
    isApproved: bool = True

    class Config:
        populate_by_name = True
