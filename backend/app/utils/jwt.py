from datetime import datetime, timedelta
from typing import Optional
import jwt
from app.config import settings


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode JWT token"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def create_otp_token(phone: str, otp: str) -> str:
    """Create a token for OTP verification"""
    data = {"phone": phone, "otp": otp, "type": "otp"}
    return create_access_token(data, timedelta(minutes=settings.OTP_EXPIRE_MINUTES))


def verify_access_token(token: str) -> Optional[dict]:
    """Verify access token and return payload"""
    return decode_token(token)
