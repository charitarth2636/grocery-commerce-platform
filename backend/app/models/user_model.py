from datetime import datetime
from typing import Optional, List
from pydantic import Field, EmailStr
from app.models.base import BaseDBModel, PyObjectId
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    DELIVERY_PARTNER = "delivery_partner"


class UserModel(BaseDBModel):
    """User model for customers"""

    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: str = Field(..., pattern=r"^\+?[6-9]\d{9,12}$")
    password: str = Field(..., min_length=6)
    role: UserRole = Field(default=UserRole.CUSTOMER)
    isActive: bool = True
    isVerified: bool = False
    profileImage: Optional[str] = None

    # Loyalty & rewards
    loyaltyPoints: int = 0
    totalOrders: int = 0

    class Config:
        populate_by_name = True
        enum_values = True


class AddressModel(BaseDBModel):
    """User address model"""

    userId: PyObjectId
    name: str = Field(..., min_length=2)
    phone: str = Field(..., pattern=r"^\+?[6-9]\d{9,12}$")
    address: str = Field(..., min_length=10)
    landmark: Optional[str] = None
    city: str = "Local City"
    state: str = "Local State"
    pincode: str = Field(..., pattern=r"^\d{6}$")
    addressType: str = Field(default="home")  # home, work, other
    isDefault: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        populate_by_name = True


class DeliveryPartnerModel(BaseDBModel):
    """Delivery partner model"""

    name: str = Field(..., min_length=2)
    phone: str = Field(..., pattern=r"^\+?[6-9]\d{9,12}$")
    password: str = Field(..., min_length=6)
    isActive: bool = True
    isAvailable: bool = True

    # Vehicle details
    vehicleType: Optional[str] = None  # bike, scooter, car
    vehicleNumber: Optional[str] = None

    # Performance
    totalDeliveries: int = 0
    rating: float = 5.0
    currentLat: Optional[float] = None
    currentLng: Optional[float] = None

    class Config:
        populate_by_name = True
