import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/grocery_db")
DATABASE_NAME = "grocery_db"

async def seed_products():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Sample products for each category
    products = [
        # Grocery & Staples
        {
            "name": "Basmati Rice Premium",
            "brand": "India Gate",
            "categoryId": "grocery",
            "description": "Premium quality basmati rice, aged for perfect cooking",
            "mrp": 350,
            "sellingPrice": 299,
            "unit": "kg",
            "unitValue": 5,
            "stockQuantity": 100,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
        },
        {
            "name": "Whole Wheat Atta",
            "brand": "Aashirvaad",
            "categoryId": "grocery",
            "description": "100% whole wheat atta for soft rotis",
            "mrp": 280,
            "sellingPrice": 245,
            "unit": "kg",
            "unitValue": 10,
            "stockQuantity": 150,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"
        },
        {
            "name": "Toor Dal",
            "brand": "Tata",
            "categoryId": "grocery",
            "description": "Premium quality toor dal",
            "mrp": 180,
            "sellingPrice": 159,
            "unit": "kg",
            "unitValue": 1,
            "stockQuantity": 80,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1515573593881-4a382d1124b2?w=400"
        },
        # Dairy
        {
            "name": "Fresh Milk",
            "brand": "Amul",
            "categoryId": "dairy",
            "description": "Fresh toned milk",
            "mrp": 28,
            "sellingPrice": 26,
            "unit": "L",
            "unitValue": 1,
            "stockQuantity": 200,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400"
        },
        {
            "name": "Curd",
            "brand": "Amul",
            "categoryId": "dairy",
            "description": "Fresh creamy curd",
            "mrp": 45,
            "sellingPrice": 40,
            "unit": "kg",
            "unitValue": 0.5,
            "stockQuantity": 100,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": False,
            "thumbnail": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400"
        },
        # Bread & Bakery
        {
            "name": "White Bread",
            "brand": "Britannia",
            "categoryId": "bakery",
            "description": "Soft and fresh white bread",
            "mrp": 40,
            "sellingPrice": 35,
            "unit": "pack",
            "unitValue": 400,
            "stockQuantity": 150,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"
        },
        # Masala & Spices
        {
            "name": "Turmeric Powder",
            "brand": "MDH",
            "categoryId": "masala",
            "description": "Pure turmeric powder",
            "mrp": 95,
            "sellingPrice": 79,
            "unit": "pack",
            "unitValue": 100,
            "stockQuantity": 120,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400"
        },
        {
            "name": "Garam Masala",
            "brand": "MDH",
            "categoryId": "masala",
            "description": "Premium garam masala",
            "mrp": 120,
            "sellingPrice": 99,
            "unit": "pack",
            "unitValue": 100,
            "stockQuantity": 80,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": False,
            "thumbnail": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400"
        },
        # Sauces & Condiments
        {
            "name": "Tomato Ketchup",
            "brand": "Kissan",
            "categoryId": "sauces",
            "description": "Tangy tomato ketchup",
            "mrp": 95,
            "sellingPrice": 79,
            "unit": "bottle",
            "unitValue": 400,
            "stockQuantity": 100,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": False,
            "thumbnail": "https://images.unsplash.com/photo-1582169662122-273256173537?w=400"
        },
        # Snacks
        {
            "name": "Potato Chips",
            "brand": "Lays",
            "categoryId": "snacks",
            "description": "Crispy and tasty potato chips",
            "mrp": 30,
            "sellingPrice": 25,
            "unit": "pack",
            "unitValue": 40,
            "stockQuantity": 200,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"
        },
        {
            "name": "Instant Noodles",
            "brand": "Maggi",
            "categoryId": "snacks",
            "description": "Instant cooking noodles",
            "mrp": 180,
            "sellingPrice": 150,
            "unit": "pack",
            "unitValue": 12,
            "stockQuantity": 150,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400"
        },
        # Beverages
        {
            "name": "Green Tea",
            "brand": "Tata",
            "categoryId": "beverages",
            "description": "Healthy green tea bags",
            "mrp": 120,
            "sellingPrice": 99,
            "unit": "pack",
            "unitValue": 25,
            "stockQuantity": 80,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": False,
            "thumbnail": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400"
        },
        {
            "name": "Instant Coffee",
            "brand": "Nescafe",
            "categoryId": "beverages",
            "description": "Instant coffee powder",
            "mrp": 280,
            "sellingPrice": 249,
            "unit": "jar",
            "unitValue": 50,
            "stockQuantity": 60,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?w=400"
        },
        # Frozen Items
        {
            "name": "Frozen Peas",
            "brand": "Farm Fresh",
            "categoryId": "frozen",
            "description": "Quick frozen green peas",
            "mrp": 85,
            "sellingPrice": 69,
            "unit": "pack",
            "unitValue": 500,
            "stockQuantity": 50,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": False,
            "thumbnail": "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400"
        },
        # Household
        {
            "name": "Detergent Powder",
            "brand": "Tide",
            "categoryId": "household",
            "description": "Powerful cleaning detergent",
            "mrp": 380,
            "sellingPrice": 329,
            "unit": "pack",
            "unitValue": 2,
            "stockQuantity": 100,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400"
        },
        {
            "name": "Floor Cleaner",
            "brand": "Harpic",
            "categoryId": "household",
            "description": "Multi-surface floor cleaner",
            "mrp": 150,
            "sellingPrice": 129,
            "unit": "bottle",
            "unitValue": 500,
            "stockQuantity": 70,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": False,
            "thumbnail": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400"
        },
        # Personal Care
        {
            "name": "Shampoo",
            "brand": "Dove",
            "categoryId": "personal",
            "description": "Gentle cleansing shampoo",
            "mrp": 280,
            "sellingPrice": 239,
            "unit": "bottle",
            "unitValue": 180,
            "stockQuantity": 80,
            "stockStatus": "in_stock",
            "isFeatured": True,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"
        },
        {
            "name": "Toothpaste",
            "brand": "Colgate",
            "categoryId": "personal",
            "description": "Advanced fluoride toothpaste",
            "mrp": 175,
            "sellingPrice": 149,
            "unit": "pack",
            "unitValue": 150,
            "stockQuantity": 120,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": True,
            "thumbnail": "https://images.unsplash.com/photo-1559863485-53c652c4f6f5?w=400"
        },
        {
            "name": "Body Soap",
            "brand": "Lux",
            "categoryId": "personal",
            "description": "Luxurious bathing soap",
            "mrp": 60,
            "sellingPrice": 45,
            "unit": "pack",
            "unitValue": 125,
            "stockQuantity": 150,
            "stockStatus": "in_stock",
            "isFeatured": False,
            "isBestseller": False,
            "thumbnail": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400"
        }
    ]
    
    # Add isActive field to all products
    for product in products:
        product["isActive"] = True
        product["isAvailable"] = True
    
    # Clear existing products
    await db.products.delete_many({})
    
    # Insert products
    result = await db.products.insert_many(products)
    print(f"✅ Seeded {len(result.inserted_ids)} products successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_products())
