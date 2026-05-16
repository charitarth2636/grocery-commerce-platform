from typing import Optional, List
from pydantic import Field
from app.models.base import BaseDBModel, PyObjectId


class CategoryModel(BaseDBModel):
    """Category model for grocery products"""

    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None

    # Hierarchy
    parentId: Optional[PyObjectId] = None
    level: int = 0  # 0 = main category

    # Display
    sortOrder: int = 0
    isActive: bool = True
    isFeatured: bool = False

    # Counts
    productCount: int = 0

    class Config:
        populate_by_name = True


# Predefined categories (as per requirements)
GROCERY_CATEGORIES = [
    {
        "name": "Grocery & Staples",
        "slug": "grocery-staples",
        "description": "Essential grocery items like rice, wheat, pulses, oils",
        "icon": "rice",
        "sortOrder": 1,
        "isActive": True,
        "isFeatured": True,
    },
    {
        "name": "Bread & Bakery",
        "slug": "bread-bakery",
        "description": "Fresh bread, buns, pastries and bakery items",
        "icon": "bread",
        "sortOrder": 2,
        "isActive": True,
        "isFeatured": True,
    },
    {
        "name": "Dairy",
        "slug": "dairy",
        "description": "Milk, cheese, butter, yogurt and dairy products",
        "icon": "milk",
        "sortOrder": 3,
        "isActive": True,
        "isFeatured": True,
    },
    {
        "name": "Masala & Spices",
        "slug": "masala-spices",
        "description": "Indian spices, masalas, and seasoning blends",
        "icon": "spice",
        "sortOrder": 4,
        "isActive": True,
        "isFeatured": True,
    },
    {
        "name": "Sauces & Condiments",
        "slug": "sauces-condiments",
        "description": "Ketchup, sauces, pickles, and condiments",
        "icon": "sauce",
        "sortOrder": 5,
        "isActive": True,
        "isFeatured": False,
    },
    {
        "name": "Snacks & Packaged Food",
        "slug": "snacks-packaged",
        "description": "Chips, biscuits, noodles, instant food",
        "icon": "snack",
        "sortOrder": 6,
        "isActive": True,
        "isFeatured": True,
    },
    {
        "name": "Frozen Items",
        "slug": "frozen-items",
        "description": "Frozen vegetables, fries, ice cream",
        "icon": "snowflake",
        "sortOrder": 7,
        "isActive": True,
        "isFeatured": False,
    },
    {
        "name": "Beverages",
        "slug": "beverages",
        "description": "Drinks, juices, shakes, water bottles",
        "icon": "drink",
        "sortOrder": 8,
        "isActive": True,
        "isFeatured": True,
    },
    {
        "name": "Household Essentials",
        "slug": "household",
        "description": "Cleaning supplies, detergents, utilities",
        "icon": "home",
        "sortOrder": 9,
        "isActive": True,
        "isFeatured": False,
    },
    {
        "name": "Personal Care",
        "slug": "personal-care",
        "description": "Shampoo, soap, toothpaste, cosmetics",
        "icon": "person",
        "sortOrder": 10,
        "isActive": True,
        "isFeatured": False,
    },
]
