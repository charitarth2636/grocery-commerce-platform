from typing import Optional, Any, List
from pydantic import BaseModel


class ApiResponse(BaseModel):
    """Standard API response"""

    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Error response"""

    success: bool = False
    message: str
    error: Optional[str] = None
    code: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated response"""

    success: bool = True
    message: str = "Success"
    data: List[Any] = []
    pagination: dict = {}


def success_response(message: str = "Success", data: Any = None) -> dict:
    """Create a success response"""
    return {"success": True, "message": message, "data": data}


def error_response(message: str, error: str = None, code: str = None) -> dict:
    """Create an error response"""
    return {"success": False, "message": message, "error": error, "code": code}


def paginated_response(data: List[Any], page: int, limit: int, total: int) -> dict:
    """Create a paginated response"""
    return {
        "success": True,
        "message": "Success",
        "data": data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }
