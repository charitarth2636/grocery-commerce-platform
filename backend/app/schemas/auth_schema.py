from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from app.models.user_model import UserRole


# Auth Schemas - Password Based (NO OTP)
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    isVerified: bool
    loyaltyPoints: int
    totalOrders: int

    class Config:
        from_attributes = True


# Address Schemas
class AddressCreateSchema(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., pattern=r"^\+?[6-9]\d{9,12}$")
    address: str = Field(..., min_length=3)
    landmark: Optional[str] = None
    city: str = "Local City"
    state: str = "Local State"
    pincode: str = Field(..., pattern=r"^\d{6}$")
    addressType: str = "home"
    isDefault: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AddressUpdateSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    addressType: Optional[str] = None
    isDefault: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AddressResponse(BaseModel):
    id: str
    name: str
    phone: str
    address: str
    landmark: Optional[str]
    city: str
    state: str
    pincode: str
    addressType: str
    isDefault: bool
    latitude: Optional[float]
    longitude: Optional[float]

    class Config:
        from_attributes = True
