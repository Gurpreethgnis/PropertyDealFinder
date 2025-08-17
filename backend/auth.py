from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import jwt
import datetime
import os

# Security scheme
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# User model
class User(BaseModel):
    email: str
    password: str

class UserInDB(BaseModel):
    email: str
    hashed_password: str
    is_active: bool = True
    is_approved: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Mock user database (in production, use a real database)
fake_users_db = {
    "admin@propertyfinder.com": {
        "email": "admin@propertyfinder.com",
        "hashed_password": "admin123",  # In production, use proper hashing
        "is_active": True,
        "is_approved": True
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # In production, use proper password hashing (e.g., bcrypt)
    return plain_password == hashed_password

def get_user(email: str) -> Optional[UserInDB]:
    """Get user from database"""
    if email in fake_users_db:
        user_dict = fake_users_db[email]
        return UserInDB(**user_dict)
    return None

def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """Authenticate a user"""
    user = get_user(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    if not user.is_approved:
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserInDB:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_approved_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Get current approved user"""
    if not current_user.is_approved:
        raise HTTPException(status_code=400, detail="User not approved")
    return current_user
