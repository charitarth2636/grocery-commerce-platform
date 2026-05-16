from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP"""
    import random

    return "".join([str(random.randint(0, 9)) for _ in range(length)])


def generate_order_number() -> str:
    """Generate a unique order number"""
    import random
    import string

    timestamp = str(int(datetime.now().timestamp()))
    random_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"GRO{timestamp}{random_suffix}"


from datetime import datetime
