from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.mongo import db
from app.routes import (
    auth_router,
    product_router,
    cart_router,
    order_router,
    wishlist_router,
    review_router,
    coupon_router,
    admin_router,
    delivery_router,
)
from app.services.product_service import product_service
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.utils.limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    db.connect()
    print("[OK] Connected to MongoDB")

    # Initialize default categories
    await product_service.initialize_categories()
    print("[OK] Categories initialized")

    yield

    # Shutdown
    db.disconnect()
    print("[INFO] Disconnected from MongoDB")


# Create FastAPI app
app = FastAPI(
    title="Grocery Commerce API",
    description="Enterprise Grocery Commerce Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiter setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(product_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(order_router, prefix="/api")
app.include_router(wishlist_router, prefix="/api")
app.include_router(review_router, prefix="/api")
app.include_router(coupon_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(delivery_router, prefix="/api")

from app.routes.ws_routes import router as ws_router
app.include_router(ws_router, prefix="/api")


# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Grocery Commerce API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


# Run the application
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
