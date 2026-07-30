import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import insert, select, update
from sqlalchemy.exc import SQLAlchemyError
from jose import jwt, JWTError
from app.database import engine
from app.routers.users import users_table
from app.validation import normalize_email, strip_required_text

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

JWT_SECRET = os.getenv("SECLAB_JWT_SECRET") or os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError(
        "SECLAB_JWT_SECRET ortam değişkeni tanımlanmalıdır."
    )
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(os.getenv("SECLAB_TOKEN_EXPIRE_MINUTES", "60"))
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("SECLAB_RESET_TOKEN_EXPIRE_MINUTES", "15"))

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, max_length=255)

    _strip_username = field_validator("username", mode="before")(strip_required_text)
    _normalize_email = field_validator("email", mode="before")(normalize_email)

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1, max_length=255)

    _normalize_email = field_validator("email", mode="before")(normalize_email)

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)

    _normalize_email = field_validator("email", mode="before")(normalize_email)


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1, max_length=2048)
    password: str = Field(..., min_length=8, max_length=255)

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=255)
    new_password: str = Field(..., min_length=8, max_length=255)


class CurrentUserUpdate(BaseModel):
    username: str | None = Field(None, min_length=1, max_length=50)
    email: str | None = Field(None, min_length=1, max_length=255)

    _strip_username = field_validator("username", mode="before")(strip_required_text)
    _normalize_email = field_validator("email", mode="before")(normalize_email)


class CurrentUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuthUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime
    access_token: str
    token_type: str = "bearer"
    expires_at: str

    class Config:
        from_attributes = True

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return f"pbkdf2_sha256${salt}${password_hash}"

def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False

    try:
        algorithm, salt, expected_hash = stored_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False

        password_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return hmac.compare_digest(password_hash, expected_hash)
    except Exception:
        return False

def build_auth_stamp(password_hash: str | None) -> str:
    if not password_hash:
        return ""

    return hashlib.sha256(password_hash.encode("utf-8")).hexdigest()


def create_password_reset_token(user_id: int, password_hash: str | None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )

    return jwt.encode(
        {
            "sub": str(user_id),
            "purpose": "password_reset",
            "auth_stamp": build_auth_stamp(password_hash),
            "jti": secrets.token_urlsafe(24),
            "exp": expire,
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def create_access_token(user_dict: dict) -> tuple[str, datetime]:
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user_dict["id"]),
        "email": user_dict["email"],
        "role": user_dict["role"],
        "auth_stamp": build_auth_stamp(user_dict.get("password_hash")),
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt, expire

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum bilgileri doğrulanamadı"
        )

def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum bulunamadı veya geçersiz"
        )
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum bilgileri geçersiz"
        )

    try:
        with engine.begin() as connection:
            query = select(users_table).where(users_table.c.id == user_id)
            user = connection.execute(query).mappings().first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Kullanıcı bulunamadı"
                )
            user_dict = dict(user)
            token_auth_stamp = payload.get("auth_stamp")
            current_auth_stamp = build_auth_stamp(user_dict.get("password_hash"))

            if not token_auth_stamp or not hmac.compare_digest(
                token_auth_stamp,
                current_auth_stamp,
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Oturum artık geçerli değil. Lütfen tekrar giriş yapın",
                )

            return user_dict
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in get_current_user: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Kimlik doğrulama servisi kullanılamıyor"
        )

def require_signed_in_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Yönetici yetkisi gerekli"
        )
    return current_user


@router.get("/me", response_model=CurrentUserResponse)
def get_my_profile(
    current_user: dict = Depends(require_signed_in_user),
):
    return current_user


@router.patch("/me", response_model=CurrentUserResponse)
def update_my_profile(
    payload: CurrentUserUpdate,
    current_user: dict = Depends(require_signed_in_user),
):
    update_data = {}

    if payload.username is not None:
        username = payload.username.strip()
        if not username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kullanıcı adı boş olamaz"
            )
        update_data["username"] = username

    if payload.email is not None:
        email = payload.email.strip().lower()
        if not email or "@" not in email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçerli bir e-posta adresi girin"
            )
        update_data["email"] = email

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Güncellenecek alan bulunamadı"
        )

    try:
        with engine.begin() as connection:
            if "email" in update_data:
                existing_user_id = connection.execute(
                    select(users_table.c.id).where(
                        users_table.c.email == update_data["email"],
                        users_table.c.id != current_user["id"]
                    )
                ).scalar_one_or_none()
                if existing_user_id is not None:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Bu e-posta adresi başka bir hesapta kullanılıyor"
                    )

            updated_user = connection.execute(
                update(users_table)
                .where(users_table.c.id == current_user["id"])
                .values(**update_data)
                .returning(
                    users_table.c.id,
                    users_table.c.username,
                    users_table.c.email,
                    users_table.c.role,
                    users_table.c.created_at
                )
            ).mappings().one()

        return dict(updated_user)
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error while updating profile: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Profil güncellenemedi"
        )

@router.post("/register", response_model=AuthUserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest):
    try:
        norm_email = payload.email.strip().lower()
        norm_username = payload.username.strip()

        if not norm_username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kullanıcı adı boş olamaz")

        with engine.begin() as connection:
            check_query = select(users_table).where(users_table.c.email == norm_email)
            existing = connection.execute(check_query).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bu e-posta adresi zaten kayıtlı"
                )

            hashed = hash_password(payload.password)
            insert_query = (
                insert(users_table)
                .values(
                    username=norm_username,
                    email=norm_email,
                    role="user",
                    password_hash=hashed
                )
                .returning(
                    users_table.c.id,
                    users_table.c.username,
                    users_table.c.email,
                    users_table.c.role,
                    users_table.c.created_at
                )
            )
            result = connection.execute(insert_query)
            new_user = dict(result.mappings().one())
            new_user["password_hash"] = hashed

            token, expire = create_access_token(new_user)
            new_user["access_token"] = token
            new_user["token_type"] = "bearer"
            new_user["expires_at"] = expire.isoformat()
            new_user.pop("password_hash", None)
            return new_user
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error during register: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Kimlik doğrulama servisi kullanılamıyor"
        )

@router.post("/login", response_model=AuthUserResponse)
def login_user(payload: LoginRequest):
    try:
        norm_email = payload.email.strip().lower()

        with engine.begin() as connection:
            query = select(users_table).where(users_table.c.email == norm_email)
            result = connection.execute(query)
            user = result.mappings().first()

            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="E-posta veya şifre hatalı"
                )

            user_dict = dict(user)
            stored_hash = user_dict.get("password_hash")
            
            if not stored_hash and user_dict["role"] == "admin":
                admin_password = os.getenv("SECLAB_ADMIN_PASSWORD")
                if admin_password and payload.password == admin_password:
                    new_hash = hash_password(payload.password)
                    update_query = (
                        update(users_table)
                        .where(users_table.c.id == user_dict["id"])
                        .values(password_hash=new_hash)
                    )
                    connection.execute(update_query)
                    user_dict["password_hash"] = new_hash

            if not verify_password(payload.password, user_dict.get("password_hash")):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="E-posta veya şifre hatalı"
                )

            token, expire = create_access_token(user_dict)
            user_dict["access_token"] = token
            user_dict["token_type"] = "bearer"
            user_dict["expires_at"] = expire.isoformat()
            return user_dict
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Kimlik doğrulama servisi kullanılamıyor"
        )


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(require_signed_in_user),
):
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yeni ÅŸifre mevcut ÅŸifreden farklÄ± olmalÄ±dÄ±r",
        )

    current_password_hash = current_user.get("password_hash")
    if not verify_password(payload.current_password, current_password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut ÅŸifre hatalÄ±",
        )

    try:
        with engine.begin() as connection:
            updated_user_id = connection.execute(
                update(users_table)
                .where(
                    users_table.c.id == current_user["id"],
                    users_table.c.password_hash == current_password_hash,
                )
                .values(password_hash=hash_password(payload.new_password))
                .returning(users_table.c.id)
            ).scalar_one_or_none()

        if updated_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Åifre baÅŸka bir iÅŸlem tarafÄ±ndan deÄŸiÅŸtirildi. Tekrar giriÅŸ yapÄ±n",
            )

        return {"message": "Åifre baÅŸarÄ±yla deÄŸiÅŸtirildi. LÃ¼tfen tekrar giriÅŸ yapÄ±n."}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error during password change: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Åifre deÄŸiÅŸtirme servisi kullanÄ±lamÄ±yor",
        )

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    norm_email = payload.email.strip().lower()

    try:
        with engine.begin() as connection:
            user = connection.execute(
                select(
                    users_table.c.id,
                    users_table.c.password_hash,
                ).where(
                    users_table.c.email == norm_email
                )
            ).mappings().first()

        # Demo akışında kod ekranda gösteriliyor. Kayıt olmayan
        # e-postalarda da hesap varlığını açıklamayan bir token üretilir.
        reset_token = create_password_reset_token(
            user["id"] if user else 0,
            user["password_hash"] if user else None,
        )

        return {
            "message": (
                "E-posta kayıtlıysa şifre sıfırlama kodu oluşturuldu."
            ),
            "demo_reset_token": reset_token,
            "expires_in_minutes": RESET_TOKEN_EXPIRE_MINUTES,
        }
    except SQLAlchemyError as error:
        print(f"Database error during forgot password: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Şifre sıfırlama servisi kullanılamıyor",
        )


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    try:
        token_payload = jwt.decode(
            payload.token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        if token_payload.get("purpose") != "password_reset":
            raise ValueError("Invalid token purpose")

        user_id = int(token_payload.get("sub"))
        token_auth_stamp = token_payload.get("auth_stamp")

        if user_id <= 0 or not isinstance(token_auth_stamp, str):
            raise ValueError("Invalid user")
    except (JWTError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre sıfırlama kodu geçersiz veya süresi dolmuş",
        )

    try:
        with engine.begin() as connection:
            user = connection.execute(
                select(
                    users_table.c.id,
                    users_table.c.password_hash,
                ).where(users_table.c.id == user_id)
            ).mappings().first()

            if user is None or not hmac.compare_digest(
                token_auth_stamp,
                build_auth_stamp(user["password_hash"]),
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Şifre sıfırlama kodu geçersiz veya süresi dolmuş",
                )

            updated_user_id = connection.execute(
                update(users_table)
                .where(
                    users_table.c.id == user_id,
                    users_table.c.password_hash == user["password_hash"],
                )
                .values(password_hash=hash_password(payload.password))
                .returning(users_table.c.id)
            ).scalar_one_or_none()

        if updated_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Şifre sıfırlama kodu geçersiz veya süresi dolmuş",
            )

        return {
            "message": "Şifre başarıyla sıfırlandı.",
        }
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error during reset password: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Şifre sıfırlama servisi kullanılamıyor",
        )
