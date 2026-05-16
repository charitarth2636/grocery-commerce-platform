from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.product_schema import (
    CategoryCreateSchema,
    CategoryUpdateSchema,
    ProductCreateSchema,
    ProductUpdateSchema,
)
from app.services.product_service import product_service
from app.middlewares.auth_middleware import get_current_user, require_admin
from app.utils.response import success_response, error_response


router = APIRouter(prefix="/products", tags=["Products"])


# ==================== CATEGORIES ====================


@router.get("/categories")
async def get_categories():
    """Get all categories"""
    return await product_service.get_all_categories()


@router.post("/categories/init")
async def initialize_categories(user: dict = Depends(require_admin)):
    """Initialize default categories (admin only)"""
    return await product_service.initialize_categories()


@router.get("/categories/{category_id}")
async def get_category(category_id: str):
    """Get category by ID"""
    category = await product_service.get_category_by_id(category_id)
    if not category:
        return error_response(message="Category not found")
    return success_response(data=category)


@router.post("/categories")
async def create_category(
    category: CategoryCreateSchema, user: dict = Depends(require_admin)
):
    """Create new category (admin only)"""
    from bson import ObjectId

    category_data = category.model_dump()
    if category_data.get("parentId"):
        category_data["parentId"] = ObjectId(category_data["parentId"])
        category_data["level"] = 1
    category_data["isActive"] = True
    category_data["productCount"] = 0
    return await product_service.create_category(category_data)


@router.put("/categories/{category_id}")
async def update_category(
    category_id: str,
    category: CategoryUpdateSchema,
    user: dict = Depends(require_admin),
):
    """Update category (admin only)"""
    from bson import ObjectId
    from datetime import datetime

    update_data = category.model_dump(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow()

    result = await product_service.update_category(category_id, update_data)
    return result


# ==================== PRODUCTS ====================


@router.get("")
async def get_products(
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    featured: bool = Query(False),
    bestseller: bool = Query(False),
):
    """Get products with filters"""
    return await product_service.get_products(
        category_id=category_id,
        search=search,
        page=page,
        limit=limit,
        featured=featured,
        bestseller=bestseller,
    )


@router.get("/featured")
async def get_featured_products():
    """Get featured products"""
    return await product_service.get_products(featured=True, limit=10)


@router.get("/bestsellers")
async def get_bestseller_products():
    """Get bestseller products"""
    return await product_service.get_products(bestseller=True, limit=10)


@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get product by ID"""
    product = await product_service.get_product_by_id(product_id)
    if not product:
        return error_response(message="Product not found")
    return success_response(data=product)


@router.get("/slug/{slug}")
async def get_product_by_slug(slug: str):
    """Get product by slug"""
    product = await product_service.get_product_by_slug(slug)
    if not product:
        return error_response(message="Product not found")
    return success_response(data=product)


# ==================== ADMIN PRODUCT OPERATIONS ====================


@router.post("")
async def create_product(
    product: ProductCreateSchema, user: dict = Depends(require_admin)
):
    """Create new product (admin only)"""
    from bson import ObjectId

    product_data = product.model_dump()
    product_data["categoryId"] = ObjectId(product_data["categoryId"])
    return await product_service.create_product(product_data)


@router.put("/{product_id}")
async def update_product(
    product_id: str, product: ProductUpdateSchema, user: dict = Depends(require_admin)
):
    """Update product (admin only)"""
    return await product_service.update_product(
        product_id, product.model_dump(exclude_unset=True)
    )


@router.delete("/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(require_admin)):
    """Delete product (admin only)"""
    return await product_service.delete_product(product_id)
