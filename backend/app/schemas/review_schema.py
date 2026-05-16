from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreateSchema(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewResponseSchema(BaseModel):
    id: str
    productId: str
    userId: str
    userName: str
    rating: float
    comment: Optional[str]
    isApproved: bool

    class Config:
        from_attributes = True
