from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    # MongoDB Configuration - MongoDB Atlas
    MONGODB_URL: str = Field(..., env="MONGODB_URL")
    DATABASE_NAME: str = Field(default="grocery_db", env="DATABASE_NAME")

    # JWT Configuration
    SECRET_KEY: str = "grocery-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OTP_EXPIRE_MINUTES: int = 5

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://grocery-commerce-platform.vercel.app"
    ]

    # Delivery Configuration
    DELIVERY_RADIUS_KM: float = 3.0
    DELIVERY_CHARGE: float = 20.0
    MIN_ORDER_AMOUNT: float = 100.0
    FREE_DELIVERY_THRESHOLD: float = 500.0

    # Store Configuration
    STORE_NAME: str = "Local Grocery Store"
    STORE_PHONE: str = "+919999999999"
    STORE_ADDRESS: str = "Local Area, City"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
