# Auth schemas - Password Based (NO OTP)
from app.schemas.auth_schema import (
    SignupRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
    AddressCreateSchema,
    AddressUpdateSchema,
    AddressResponse,
)

# Product schemas
from app.schemas.product_schema import (
    CategoryCreateSchema,
    CategoryUpdateSchema,
    CategoryResponse,
    ProductCreateSchema,
    ProductUpdateSchema,
    ProductResponse,
    ProductListResponse,
)

# Cart schemas
from app.schemas.cart_schema import (
    AddToCartSchema,
    UpdateCartItemSchema,
    CartItemResponse,
    CartResponse,
    OrderItemSchema,
    DeliveryAddressSchema,
    TimeSlotSchema,
    CreateOrderSchema,
    OrderItemResponse,
    OrderResponse,
    OrderListResponse,
)

__all__ = [
    # Auth
    "SignupRequest",
    "LoginRequest",
    "LoginResponse",
    "UserResponse",
    "AddressCreateSchema",
    "AddressUpdateSchema",
    "AddressResponse",
    # Product
    "CategoryCreateSchema",
    "CategoryUpdateSchema",
    "CategoryResponse",
    "ProductCreateSchema",
    "ProductUpdateSchema",
    "ProductResponse",
    "ProductListResponse",
    # Cart
    "AddToCartSchema",
    "UpdateCartItemSchema",
    "CartItemResponse",
    "CartResponse",
    "OrderItemSchema",
    "DeliveryAddressSchema",
    "TimeSlotSchema",
    "CreateOrderSchema",
    "OrderItemResponse",
    "OrderResponse",
    "OrderListResponse",
]
