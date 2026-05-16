from typing import Optional, List
from pydantic import Field
from app.models.base import BaseDBModel, PyObjectId
from enum import Enum
from datetime import datetime


class OrderStatus(str, Enum):
    # Order lifecycle
    PENDING = "pending"
    ASSIGNED = "assigned"  # New status: Admin has assigned, rider hasn't accepted yet
    ACCEPTED = "accepted"
    PREPARING = "preparing"
    PICKED_UP = "picked_up"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    COD = "cod"  # Cash on Delivery
    UPI = "upi"
    CARD = "card"
    WALLET = "wallet"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class DeliveryType(str, Enum):
    DELIVERY = "delivery"
    PICKUP = "pickup"


class OrderItemModel(BaseDBModel):
    """Individual item in an order"""

    productId: PyObjectId
    productName: str
    productImage: Optional[str] = None

    # Pricing snapshot
    mrp: float
    sellingPrice: float
    discountPercent: int

    # Quantity
    quantity: int
    unit: str
    unitValue: float

    # Total
    totalPrice: float
    totalMrp: float
    savings: float

    # Status
    isAvailable: bool = True
    note: Optional[str] = None

    class Config:
        populate_by_name = True


class DeliveryAddressModel(BaseDBModel):
    """Delivery address for order"""

    name: str
    phone: str
    address: str
    landmark: Optional[str] = None
    city: str = "Local City"
    pincode: str
    addressType: str = "home"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        populate_by_name = True


class TimeSlotModel(BaseDBModel):
    """Delivery time slot"""

    date: str  # YYYY-MM-DD
    slot: str  # e.g., "09:00-12:00"
    isAvailable: bool = True
    maxOrders: int = 10
    currentOrders: int = 0

    class Config:
        populate_by_name = True


class OrderModel(BaseDBModel):
    """Order model"""

    # User info
    userId: PyObjectId
    userName: str
    userPhone: str

    # Order identification
    orderNumber: str  # Unique order number

    # Items
    items: List[OrderItemModel] = Field(default_factory=list)
    itemCount: int = 0

    # Pricing
    subtotal: float = 0
    itemSavings: float = 0
    deliveryCharge: float = 0
    couponCode: Optional[str] = None
    couponDiscount: float = 0
    totalAmount: float = 0

    # Progress
    timeline: List[dict] = Field(default_factory=list)

    # Delivery
    deliveryType: DeliveryType = DeliveryType.DELIVERY
    deliveryAddress: Optional[DeliveryAddressModel] = None
    timeSlot: Optional[TimeSlotModel] = None

    # Status
    orderStatus: OrderStatus = OrderStatus.PENDING
    paymentMethod: PaymentMethod = PaymentMethod.COD
    paymentStatus: PaymentStatus = PaymentStatus.PENDING

    # Delivery partner
    deliveryPartnerId: Optional[PyObjectId] = None
    deliveryPartnerName: Optional[str] = None
    deliveryPartnerPhone: Optional[str] = None

    # Timestamps
    acceptedAt: Optional[datetime] = None
    preparingAt: Optional[datetime] = None
    pickedUpAt: Optional[datetime] = None
    outForDeliveryAt: Optional[datetime] = None
    deliveredAt: Optional[datetime] = None
    cancelledAt: Optional[datetime] = None
    cancelledBy: Optional[str] = None
    cancellationReason: Optional[str] = None

    # Notes
    specialInstructions: Optional[str] = None

    # Admin notes
    adminNote: Optional[str] = None

    class Config:
        populate_by_name = True
        enum_values = True


class OrderStatusHistoryModel(BaseDBModel):
    """Track order status changes"""

    orderId: PyObjectId
    status: OrderStatus
    note: Optional[str] = None
    updatedBy: Optional[str] = None  # user, admin, system

    class Config:
        populate_by_name = True
