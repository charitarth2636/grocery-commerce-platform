from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.schemas.auth_schema import (
    SignupRequest,
    LoginRequest,
    UserResponse,
    AddressCreateSchema,
    AddressUpdateSchema,
    AddressResponse,
)
from app.services.auth_service import auth_service
from app.services.address_service import address_service
from app.middlewares.auth_middleware import get_current_user
from app.utils.response import success_response, error_response
from app.utils.limiter import limiter


router = APIRouter(prefix="/auth", tags=["Authentication"])


# ==================== PASSWORD-BASED AUTH (NO OTP) ====================


@router.post("/signup")
@limiter.limit("5/minute")
async def signup(body: SignupRequest, request: Request):
    """Register new user with email and password"""
    # Extract role if provided in request body (for rider signup)
    data = await request.json()
    role = data.get("role", "customer")
    return await auth_service.register(body.name, body.email, body.password, role)


@router.post("/login")
@limiter.limit("5/minute")
async def login(body: LoginRequest, request: Request):
    """Login with email and password"""
    return await auth_service.login(body.email, body.password)


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user profile"""
    user_data = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user.get("email"),
        "role": user["role"],
        "isVerified": user.get("isVerified", False),
        "loyaltyPoints": user.get("loyaltyPoints", 0),
        "totalOrders": user.get("totalOrders", 0),
    }
    return success_response(data=user_data)


@router.put("/profile")
async def update_profile(update_data: dict, user: dict = Depends(get_current_user)):
    """Update user profile"""
    # Only allow certain fields to be updated
    allowed_fields = ["name", "email"]
    filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
    return await auth_service.update_user(str(user["_id"]), filtered_data)


# ==================== ADDRESSES ====================


@router.get("/addresses")
async def get_addresses(user: dict = Depends(get_current_user)):
    """Get all saved addresses"""
    return await address_service.get_addresses(str(user["_id"]))


@router.post("/addresses")
async def create_address(
    address: AddressCreateSchema, user: dict = Depends(get_current_user)
):
    """Add new address"""
    return await address_service.create_address(str(user["_id"]), address.model_dump())


@router.put("/addresses/{address_id}")
async def update_address(
    address_id: str,
    address: AddressUpdateSchema,
    user: dict = Depends(get_current_user),
):
    """Update address"""
    return await address_service.update_address(
        address_id, str(user["_id"]), address.model_dump(exclude_unset=True)
    )


@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: dict = Depends(get_current_user)):
    """Delete address"""
    return await address_service.delete_address(address_id, str(user["_id"]))
