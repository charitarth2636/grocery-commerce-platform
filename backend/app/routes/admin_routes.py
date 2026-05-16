from fastapi import APIRouter, Depends
from app.middlewares.auth_middleware import require_admin
from app.services.admin_service import admin_service

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/dashboard/analytics")
async def get_dashboard_analytics(user: dict = Depends(require_admin)):
    """Get high-level dashboard metrics for admin panel"""
    return await admin_service.get_analytics()


@router.get("/users")
async def get_all_users(role: str = "customer", user: dict = Depends(require_admin)):
    """List all registered users with optional role filter"""
    return await admin_service.get_users(role)


# ==================== RIDER MANAGEMENT ====================


@router.post("/riders")
async def create_rider(rider: dict, user: dict = Depends(require_admin)):
    """Create a new delivery partner"""
    return await admin_service.create_rider(rider)


@router.put("/riders/{rider_id}")
async def update_rider(rider_id: str, rider: dict, user: dict = Depends(require_admin)):
    """Update a delivery partner"""
    return await admin_service.update_rider(rider_id, rider)


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str, status_data: dict, user: dict = Depends(require_admin)
):
    """Update user account status (active/blocked)"""
    return await admin_service.update_user_status(user_id, status_data)


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(require_admin)):
    """Delete any user"""
    return await admin_service.delete_user(user_id)


# ==================== SETTINGS ====================


@router.get("/settings")
async def get_settings(user: dict = Depends(require_admin)):
    """Get global store settings"""
    return await admin_service.get_settings()


@router.put("/settings")
async def update_settings(settings: dict, user: dict = Depends(require_admin)):
    """Update global store settings"""
    return await admin_service.update_settings(settings)


# ==================== PRODUCT MANAGEMENT ====================


@router.post("/products")
async def admin_create_product(product: dict, user: dict = Depends(require_admin)):
    """Create new product"""
    from app.services.product_service import product_service

    return await product_service.create_product(product)


@router.put("/products/{product_id}")
async def admin_update_product(
    product_id: str, product: dict, user: dict = Depends(require_admin)
):
    """Update product"""
    from app.services.product_service import product_service

    return await product_service.update_product(product_id, product)


# ==================== CATEGORY MANAGEMENT ====================


@router.get("/categories")
async def admin_get_categories(user: dict = Depends(require_admin)):
    """Get all categories for admin"""
    from app.services.product_service import product_service

    # Reusing the existing service call structure
    return await product_service.get_all_categories()


@router.post("/categories")
async def admin_create_category(category: dict, user: dict = Depends(require_admin)):
    """Create new category"""
    from app.schemas.product_schema import CategoryCreateSchema
    from app.services.product_service import product_service
    from bson import ObjectId

    schema = CategoryCreateSchema(**category)
    category_data = schema.model_dump()

    if category_data.get("parentId"):
        category_data["parentId"] = ObjectId(category_data["parentId"])
        category_data["level"] = 1
    category_data["isActive"] = True
    category_data["productCount"] = 0
    return await product_service.create_category(category_data)


@router.put("/categories/{category_id}")
async def admin_update_category(
    category_id: str, category: dict, user: dict = Depends(require_admin)
):
    """Update category"""
    from app.schemas.product_schema import CategoryUpdateSchema
    from app.services.product_service import product_service
    from datetime import datetime

    schema = CategoryUpdateSchema(**category)
    update_data = schema.model_dump(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow()

    return await product_service.update_category(category_id, update_data)


# ==================== COUPON MANAGEMENT ====================


@router.get("/coupons")
async def admin_get_coupons(user: dict = Depends(require_admin)):
    """List all coupons"""
    from app.services.coupon_service import coupon_service

    return await coupon_service.get_all_coupons()


@router.post("/coupons")
async def admin_create_coupon(coupon: dict, user: dict = Depends(require_admin)):
    """Create new coupon"""
    from app.services.coupon_service import coupon_service

    return await coupon_service.create_coupon(coupon)


@router.put("/coupons/{coupon_id}")
async def admin_update_coupon(
    coupon_id: str, coupon: dict, user: dict = Depends(require_admin)
):
    """Update coupon"""
    from app.services.coupon_service import coupon_service

    return await coupon_service.update_coupon(coupon_id, coupon)


@router.delete("/coupons/{coupon_id}")
async def admin_delete_coupon(coupon_id: str, user: dict = Depends(require_admin)):
    """Delete coupon"""
    from app.services.coupon_service import coupon_service

    return await coupon_service.delete_coupon(coupon_id)


@router.delete("/categories/{category_id}")
async def admin_delete_category(category_id: str, user: dict = Depends(require_admin)):
    """Delete category"""
    from app.services.product_service import product_service

    return await product_service.delete_category(category_id)
