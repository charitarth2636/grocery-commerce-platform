from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.product_model import ProductUnit, StockStatus


# Category Schemas
class CategoryCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    parentId: Optional[str] = None
    isFeatured: bool = False


class CategoryUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    isActive: Optional[bool] = None
    isFeatured: Optional[bool] = None
    sortOrder: Optional[int] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str]
    image: Optional[str]
    icon: Optional[str]
    parentId: Optional[str]
    level: int
    isActive: bool
    isFeatured: bool
    productCount: int
    sortOrder: int

    class Config:
        from_attributes = True


# Product Schemas
class ProductCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    categoryId: str
    categoryName: str
    brand: Optional[str] = None
    mrp: float = Field(..., gt=0)
    sellingPrice: float = Field(..., gt=0)
    stockQuantity: int = Field(default=0, ge=0)
    lowStockThreshold: int = Field(default=10)
    unit: ProductUnit = ProductUnit.PIECE
    unitValue: float = Field(default=1.0, gt=0)
    images: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    isBestseller: bool = False
    isFeatured: bool = False
    isNew: bool = False
    isOrganic: bool = False
    expiryDate: Optional[str] = None
    manufacturer: Optional[str] = None


class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    mrp: Optional[float] = None
    sellingPrice: Optional[float] = None
    stockQuantity: Optional[int] = None
    lowStockThreshold: Optional[int] = None
    unit: Optional[ProductUnit] = None
    unitValue: Optional[float] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    isBestseller: Optional[bool] = None
    isFeatured: Optional[bool] = None
    isNew: Optional[bool] = None
    isOrganic: Optional[bool] = None
    isActive: Optional[bool] = None
    isAvailable: Optional[bool] = None
    expiryDate: Optional[str] = None
    manufacturer: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str]
    categoryId: str
    categoryName: str
    brand: Optional[str]
    mrp: float
    sellingPrice: float
    discountPercent: int
    stockQuantity: int
    stockStatus: str
    unit: str
    unitValue: float
    images: List[str]
    thumbnail: Optional[str]
    tags: List[str]
    isBestseller: bool
    isFeatured: bool
    isNew: bool
    isOrganic: bool
    isActive: bool
    isAvailable: bool
    viewCount: int
    orderCount: int

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    id: str
    name: str
    slug: str
    categoryName: str
    brand: Optional[str]
    mrp: float
    sellingPrice: float
    discountPercent: int
    stockStatus: str
    unit: str
    unitValue: float
    thumbnail: Optional[str]
    isBestseller: bool
    isFeatured: bool
    isNew: bool

    class Config:
        from_attributes = True
