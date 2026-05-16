# Auth routes
from app.routes.auth_routes import router as auth_router
from app.routes.product_routes import router as product_router
from app.routes.cart_routes import router as cart_router
from app.routes.order_routes import router as order_router
from app.routes.wishlist_routes import router as wishlist_router
from app.routes.review_routes import router as review_router
from app.routes.coupon_routes import router as coupon_router
from app.routes.admin_routes import router as admin_router
from app.routes.delivery_routes import router as delivery_router

__all__ = [
    "auth_router",
    "product_router",
    "cart_router",
    "order_router",
    "wishlist_router",
    "review_router",
    "coupon_router",
    "admin_router",
    "delivery_router",
]
