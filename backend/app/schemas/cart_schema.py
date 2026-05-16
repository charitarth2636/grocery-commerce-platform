from pydantic import BaseModel, Field
from typing import Optional, List


# Cart Item Schemas
class AddToCartSchema(BaseModel):
    productId: str
    quantity: int = Field(..., ge=1)


class UpdateCartItemSchema(BaseModel):
    quantity: int = Field(..., ge=0)  # 0 = remove item


class CartItemResponse(BaseModel):
    id: str
    productId: str
    productName: str
    productImage: Optional[str]
    unit: str
    unitValue: float
    mrp: float
    sellingPrice: float
    discountPercent: int
    quantity: int
    totalPrice: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: str
    userId: str
    items: List[CartItemResponse]
    itemCount: int
    subtotal: float
    totalSavings: float

    class Config:
        from_attributes = True


# Order Schemas
class OrderItemSchema(BaseModel):
    productId: str
    quantity: int = Field(..., ge=1)
    note: Optional[str] = None


class DeliveryAddressSchema(BaseModel):
    addressId: Optional[str] = None  # If using saved address
    name: str
    phone: str
    address: str
    landmark: Optional[str] = None
    city: str = "Local City"
    pincode: str
    addressType: str = "home"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class TimeSlotSchema(BaseModel):
    date: str  # YYYY-MM-DD
    slot: str  # e.g., "09:00-12:00"


class CreateOrderSchema(BaseModel):
    items: List[OrderItemSchema]
    deliveryType: str = "delivery"  # delivery or pickup
    deliveryAddress: Optional[DeliveryAddressSchema] = None
    timeSlot: Optional[TimeSlotSchema] = None
    paymentMethod: str = "cod"
    specialInstructions: Optional[str] = None
    couponCode: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    productId: str
    productName: str
    productImage: Optional[str]
    mrp: float
    sellingPrice: float
    discountPercent: int
    quantity: int
    unit: str
    unitValue: float
    totalPrice: float
    totalMrp: float
    savings: float
    isAvailable: bool

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    orderNumber: str
    userId: str
    userName: str
    userPhone: str
    items: List[OrderItemResponse]
    itemCount: int
    subtotal: float
    itemSavings: float
    deliveryCharge: float
    couponDiscount: float
    totalAmount: float
    deliveryType: str
    orderStatus: str
    paymentMethod: str
    paymentStatus: str
    deliveryPartnerId: Optional[str]
    deliveryPartnerName: Optional[str]
    deliveryPartnerPhone: Optional[str]
    specialInstructions: Optional[str]
    createdAt: str

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    id: str
    orderNumber: str
    itemCount: int
    totalAmount: float
    deliveryType: str
    orderStatus: str
    paymentMethod: str
    paymentStatus: str
    createdAt: str

    class Config:
        from_attributes = True
