from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.utils.jwt import verify_access_token
from app.database.mongo import db, COLLECTIONS
from bson import ObjectId


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Get current authenticated user from token"""
    token = credentials.credentials
    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("userId")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Get user from database
    user = await db.get_collection(COLLECTIONS["USERS"]).find_one(
        {"_id": ObjectId(user_id)}
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.get("isActive", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
):
    """Get current user if token is provided, otherwise return None"""
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_role(allowed_roles: list):
    """Dependency to require specific roles (Case-insensitive)"""

    async def role_checker(user: dict = Depends(get_current_user)):
        user_role = str(user.get("role", "")).lower()
        allowed_roles_lower = [role.lower() for role in allowed_roles]

        if user_role not in allowed_roles_lower:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User role '{user_role}' not authorized. Required: {allowed_roles}",
            )
        return user

    return role_checker


# Common role dependencies
require_admin = require_role(["admin"])
require_customer = require_role(["customer", "admin"])
require_delivery_partner = require_role(["delivery_partner", "admin"])
require_any_user = require_role(["customer", "admin", "delivery_partner"])
