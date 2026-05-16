from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from app.database.mongo import db, COLLECTIONS
from app.models.category_model import GROCERY_CATEGORIES
from app.models.product_model import ProductUnit, StockStatus
from app.utils.response import success_response, error_response, paginated_response


class ProductService:
    """Product and category service"""

    # ==================== CATEGORY OPERATIONS ====================

    @staticmethod
    async def initialize_categories() -> dict:
        """Initialize default categories"""
        categories_collection = db.get_collection(COLLECTIONS["CATEGORIES"])

        # Check if categories already exist
        existing_count = await categories_collection.count_documents({})
        if existing_count > 0:
            return success_response(message="Categories already initialized")

        # Insert default categories
        for cat in GROCERY_CATEGORIES:
            cat["createdAt"] = datetime.utcnow()
            cat["updatedAt"] = datetime.utcnow()
            cat["level"] = 0
            cat["productCount"] = 0

        await categories_collection.insert_many(GROCERY_CATEGORIES)
        return success_response(message="Categories initialized successfully")

    @staticmethod
    async def get_all_categories() -> dict:
        """Get all active categories"""
        categories = (
            await db.get_collection(COLLECTIONS["CATEGORIES"])
            .find({"isActive": True})
            .sort("sortOrder", 1)
            .to_list(length=100)
        )

        result = []
        for cat in categories:
            cat["id"] = str(cat.pop("_id"))
            result.append(cat)

        return success_response(data=result)

    @staticmethod
    async def get_category_by_id(category_id: str) -> Optional[dict]:
        """Get category by ID"""
        try:
            category = await db.get_collection(COLLECTIONS["CATEGORIES"]).find_one(
                {"_id": ObjectId(category_id)}
            )
            if category:
                category["id"] = str(category.pop("_id"))
            return category
        except:
            return None

    @staticmethod
    async def create_category(category_data: dict) -> dict:
        """Create a new category"""
        category_data["createdAt"] = datetime.utcnow()
        category_data["updatedAt"] = datetime.utcnow()
        category_data["productCount"] = 0

        result = await db.get_collection(COLLECTIONS["CATEGORIES"]).insert_one(
            category_data
        )
        category_data["id"] = str(result.inserted_id)

        return success_response(
            message="Category created successfully", data=category_data
        )

    @staticmethod
    async def update_category(category_id: str, update_data: dict) -> dict:
        """Update category"""
        result = await db.get_collection(COLLECTIONS["CATEGORIES"]).update_one(
            {"_id": ObjectId(category_id)}, {"$set": update_data}
        )

        if result.modified_count > 0:
            return success_response(message="Category updated successfully")
        return error_response(message="No changes made")

    @staticmethod
    async def delete_category(category_id: str) -> dict:
        """Delete (deactivate) category"""
        from datetime import datetime

        result = await db.get_collection(COLLECTIONS["CATEGORIES"]).update_one(
            {"_id": ObjectId(category_id)},
            {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}},
        )

        if result.modified_count > 0:
            return success_response(message="Category deleted successfully")
        return error_response(message="Category not found")

    # ==================== PRODUCT OPERATIONS ====================

    @staticmethod
    async def create_product(product_data: dict) -> dict:
        """Create a new product"""
        # Calculate discount percent
        if product_data.get("mrp") and product_data.get("sellingPrice"):
            discount = int(
                (
                    (product_data["mrp"] - product_data["sellingPrice"])
                    / product_data["mrp"]
                )
                * 100
            )
            product_data["discountPercent"] = discount

        # Set stock status
        stock_qty = product_data.get("stockQuantity", 0)
        threshold = product_data.get("lowStockThreshold", 10)
        if stock_qty == 0:
            product_data["stockStatus"] = StockStatus.OUT_OF_STOCK.value
        elif stock_qty <= threshold:
            product_data["stockStatus"] = StockStatus.LOW_STOCK.value
        else:
            product_data["stockStatus"] = StockStatus.IN_STOCK.value

        # Set default values
        product_data["isActive"] = True
        product_data["isAvailable"] = True
        product_data["viewCount"] = 0
        product_data["orderCount"] = 0
        product_data["createdAt"] = datetime.utcnow()
        product_data["updatedAt"] = datetime.utcnow()

        # Generate thumbnail from first image
        if product_data.get("images"):
            product_data["thumbnail"] = product_data["images"][0]

        result = await db.get_collection(COLLECTIONS["PRODUCTS"]).insert_one(
            product_data
        )

        # Update category product count
        await db.get_collection(COLLECTIONS["CATEGORIES"]).update_one(
            {"_id": ObjectId(product_data["categoryId"])}, {"$inc": {"productCount": 1}}
        )

        product_data["id"] = str(result.inserted_id)
        product_data.pop("_id", None)

        return success_response(
            message="Product created successfully", data=product_data
        )

    @staticmethod
    async def get_products(
        category_id: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        featured: bool = False,
        bestseller: bool = False,
    ) -> dict:
        """Get products with filters"""
        query = {"isActive": True}

        if category_id:
            try:
                query["categoryId"] = ObjectId(category_id)
            except:
                pass

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"brand": {"$regex": search, "$options": "i"}},
                {"tags": {"$regex": search, "$options": "i"}},
            ]

        if featured:
            query["isFeatured"] = True

        if bestseller:
            query["isBestseller"] = True

        # Get total count
        total = await db.get_collection(COLLECTIONS["PRODUCTS"]).count_documents(query)

        # Get products
        products = (
            await db.get_collection(COLLECTIONS["PRODUCTS"])
            .find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("createdAt", -1)
            .to_list(length=limit)
        )

        result = []
        for prod in products:
            prod["id"] = str(prod.pop("_id"))
            result.append(prod)

        return paginated_response(result, page, limit, total)

    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[dict]:
        """Get product by ID"""
        try:
            product = await db.get_collection(COLLECTIONS["PRODUCTS"]).find_one(
                {"_id": ObjectId(product_id)}
            )
            if product:
                # Increment view count
                await db.get_collection(COLLECTIONS["PRODUCTS"]).update_one(
                    {"_id": ObjectId(product_id)}, {"$inc": {"viewCount": 1}}
                )
                product["id"] = str(product.pop("_id"))
            return product
        except:
            return None

    @staticmethod
    async def get_product_by_slug(slug: str) -> Optional[dict]:
        """Get product by slug"""
        product = await db.get_collection(COLLECTIONS["PRODUCTS"]).find_one(
            {"slug": slug, "isActive": True}
        )
        if product:
            product["id"] = str(product.pop("_id"))
        return product

    @staticmethod
    async def update_product(product_id: str, update_data: dict) -> dict:
        """Update product"""
        # Recalculate discount if prices changed
        if "mrp" in update_data or "sellingPrice" in update_data:
            product = await db.get_collection(COLLECTIONS["PRODUCTS"]).find_one(
                {"_id": ObjectId(product_id)}
            )
            mrp = update_data.get("mrp", product.get("mrp"))
            selling = update_data.get("sellingPrice", product.get("sellingPrice"))
            update_data["discountPercent"] = int(((mrp - selling) / mrp) * 100)

        # Update stock status
        if "stockQuantity" in update_data:
            threshold = update_data.get("lowStockThreshold", 10)
            qty = update_data["stockQuantity"]
            if qty == 0:
                update_data["stockStatus"] = StockStatus.OUT_OF_STOCK.value
            elif qty <= threshold:
                update_data["stockStatus"] = StockStatus.LOW_STOCK.value
            else:
                update_data["stockStatus"] = StockStatus.IN_STOCK.value

        update_data["updatedAt"] = datetime.utcnow()

        result = await db.get_collection(COLLECTIONS["PRODUCTS"]).update_one(
            {"_id": ObjectId(product_id)}, {"$set": update_data}
        )

        if result.modified_count > 0:
            return success_response(message="Product updated successfully")
        return error_response(message="No changes made")

    @staticmethod
    async def delete_product(product_id: str) -> dict:
        """Delete (deactivate) product"""
        result = await db.get_collection(COLLECTIONS["PRODUCTS"]).update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}},
        )

        if result.modified_count > 0:
            return success_response(message="Product deleted successfully")
        return error_response(message="Product not found")

    @staticmethod
    async def update_stock(product_id: str, quantity_change: int) -> dict:
        """Update product stock"""
        product = await db.get_collection(COLLECTIONS["PRODUCTS"]).find_one(
            {"_id": ObjectId(product_id)}
        )
        if not product:
            return error_response(message="Product not found")

        new_quantity = product["stockQuantity"] + quantity_change
        if new_quantity < 0:
            return error_response(message="Insufficient stock")

        # Determine stock status
        threshold = product.get("lowStockThreshold", 10)
        if new_quantity == 0:
            stock_status = StockStatus.OUT_OF_STOCK.value
        elif new_quantity <= threshold:
            stock_status = StockStatus.LOW_STOCK.value
        else:
            stock_status = StockStatus.IN_STOCK.value

        await db.get_collection(COLLECTIONS["PRODUCTS"]).update_one(
            {"_id": ObjectId(product_id)},
            {
                "$set": {
                    "stockQuantity": new_quantity,
                    "stockStatus": stock_status,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        return success_response(message="Stock updated successfully")


product_service = ProductService()
