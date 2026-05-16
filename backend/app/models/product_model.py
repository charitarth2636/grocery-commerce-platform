from typing import Optional, List
from pydantic import Field
from app.models.base import BaseDBModel, PyObjectId
from enum import Enum


class ProductUnit(str, Enum):
    PIECE = "piece"
    KG = "kg"
    GRAM = "g"
    LITER = "L"
    ML = "ml"
    PACK = "pack"


class StockStatus(str, Enum):
    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"


class ProductModel(BaseDBModel):
    """Product model for grocery items"""

    name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None

    # Category reference
    categoryId: PyObjectId
    categoryName: str

    # Brand
    brand: Optional[str] = None

    # Pricing
    mrp: float = Field(..., gt=0)  # Maximum Retail Price
    sellingPrice: float = Field(..., gt=0)  # Price after discount
    discountPercent: int = Field(default=0, ge=0, le=100)

    # Stock
    stockQuantity: int = Field(default=0, ge=0)
    lowStockThreshold: int = Field(default=10)
    stockStatus: StockStatus = StockStatus.IN_STOCK

    # Unit
    unit: ProductUnit = ProductUnit.PIECE
    unitValue: float = Field(default=1.0, gt=0)  # e.g., 1 kg, 500 ml

    # Images
    images: List[str] = Field(default_factory=list)
    thumbnail: Optional[str] = None

    # Tags
    tags: List[str] = Field(default_factory=list)
    isBestseller: bool = False
    isFeatured: bool = False
    isNew: bool = False

    # Organic / Special
    isOrganic: bool = False
    isImported: bool = False

    # Availability
    isActive: bool = True
    isAvailable: bool = True

    # Metadata
    expiryDate: Optional[str] = None
    manufacturer: Optional[str] = None
    countryOfOrigin: Optional[str] = "India"

    # Search optimization
    searchKeywords: List[str] = Field(default_factory=list)

    # Analytics
    viewCount: int = 0
    orderCount: int = 0
    averageRating: float = Field(default=0.0, ge=0, le=5)
    reviewCount: int = 0

    class Config:
        populate_by_name = True
        enum_values = True


class CartItemModel(BaseDBModel):
    """Cart item model"""

    userId: PyObjectId
    productId: PyObjectId

    # Product snapshot (to preserve info even if product changes)
    productName: str
    productImage: Optional[str] = None
    unit: ProductUnit
    unitValue: float

    # Pricing snapshot
    mrp: float
    sellingPrice: float
    discountPercent: int

    # Quantity
    quantity: int = Field(..., ge=1)

    # Total
    totalPrice: float

    class Config:
        populate_by_name = True


class CartModel(BaseDBModel):
    """Cart model"""

    userId: PyObjectId
    items: List[CartItemModel] = Field(default_factory=list)

    # Totals
    itemCount: int = 0
    subtotal: float = 0
    totalSavings: float = 0

    # Applied offers
    appliedCoupon: Optional[str] = None
    couponDiscount: float = 0

    class Config:
        populate_by_name = True
