from typing import List
from pydantic import Field
from app.models.base import BaseDBModel, PyObjectId


class WishlistModel(BaseDBModel):
    """User wishlist model"""

    userId: PyObjectId

    # List of product IDs in wishlist
    productIds: List[PyObjectId] = Field(default_factory=list)

    class Config:
        populate_by_name = True
