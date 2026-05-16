from pydantic import BaseModel
from typing import List


class WishlistAddRemoveSchema(BaseModel):
    productId: str


class WishlistResponseSchema(BaseModel):
    id: str
    userId: str
    productIds: List[str]

    class Config:
        from_attributes = True
