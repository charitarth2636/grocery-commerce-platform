from fastapi import APIRouter, Depends
from app.middlewares.auth_middleware import get_current_user
from app.services.review_service import review_service
from app.schemas.review_schema import ReviewCreateSchema

router = APIRouter(prefix="/products", tags=["Reviews"])


@router.get("/{product_id}/reviews")
async def get_reviews(product_id: str):
    return await review_service.get_product_reviews(product_id)


@router.post("/{product_id}/reviews")
async def add_review(
    product_id: str, data: ReviewCreateSchema, user: dict = Depends(get_current_user)
):
    return await review_service.add_review(
        str(user["_id"]), user["name"], product_id, data.rating, data.comment
    )
