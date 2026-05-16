# Auth service
from app.services.auth_service import auth_service, AuthService

# Product service
from app.services.product_service import product_service, ProductService

# Cart service
from app.services.cart_service import cart_service, CartService

# Order service
from app.services.order_service import order_service, OrderService

# Address service
from app.services.address_service import address_service, AddressService

__all__ = [
    "auth_service",
    "AuthService",
    "product_service",
    "ProductService",
    "cart_service",
    "CartService",
    "order_service",
    "OrderService",
    "address_service",
    "AddressService",
]
