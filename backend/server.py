from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- Setup ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="EV Mart API")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

# ---------- Helpers ----------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- Models ----------
class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tagline: str
    price: float
    original_price: Optional[float] = None
    battery: str          # e.g. "3.5 kWh"
    range_km: int         # driving range in km
    top_speed: int        # km/h
    charging_time: str    # e.g. "4 hours"
    motor: str            # e.g. "6000W BLDC"
    colors: List[str] = []
    image: str
    gallery: List[str] = []
    stock: int = 10
    featured: bool = False
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductInput(BaseModel):
    name: str
    tagline: str
    price: float
    original_price: Optional[float] = None
    battery: str
    range_km: int
    top_speed: int
    charging_time: str
    motor: str
    colors: List[str] = []
    image: str
    gallery: List[str] = []
    stock: int = 10
    featured: bool = False
    description: str


class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str


class OrderInput(BaseModel):
    items: List[OrderItem]
    full_name: str
    phone: str
    address: str
    city: str
    pincode: str
    payment_method: str = "Cash on Delivery"


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    items: List[OrderItem]
    total: float
    full_name: str
    phone: str
    address: str
    city: str
    pincode: str
    payment_method: str
    status: str = "Confirmed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Auth Routes ----------
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(payload: RegisterInput):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name,
        "role": "customer",
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, "customer")
    return AuthResponse(
        token=token,
        user=UserPublic(id=user_id, email=email, name=payload.name, role="customer"),
    )


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginInput):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    return AuthResponse(
        token=token,
        user=UserPublic(id=user["id"], email=user["email"], name=user["name"], role=user["role"]),
    )


@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return UserPublic(id=user["id"], email=user["email"], name=user["name"], role=user["role"])


# ---------- Product Routes ----------
@api_router.get("/products", response_model=List[Product])
async def list_products():
    items = await db.products.find({}, {"_id": 0}).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return items


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    item = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(item.get("created_at"), str):
        item["created_at"] = datetime.fromisoformat(item["created_at"])
    return item


@api_router.post("/products", response_model=Product)
async def create_product(payload: ProductInput, _admin: dict = Depends(get_admin_user)):
    product = Product(**payload.model_dump())
    doc = product.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return product


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductInput, _admin: dict = Depends(get_admin_user)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    update_doc = payload.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_doc})
    merged = {**existing, **update_doc}
    if isinstance(merged.get("created_at"), str):
        merged["created_at"] = datetime.fromisoformat(merged["created_at"])
    return Product(**merged)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _admin: dict = Depends(get_admin_user)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}


# ---------- Orders ----------
@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderInput, user: dict = Depends(get_current_user)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    total = sum(i.price * i.quantity for i in payload.items)
    order = Order(
        user_id=user["id"],
        user_email=user["email"],
        items=payload.items,
        total=round(total, 2),
        full_name=payload.full_name,
        phone=payload.phone,
        address=payload.address,
        city=payload.city,
        pincode=payload.pincode,
        payment_method=payload.payment_method,
    )
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders/me", response_model=List[Order])
async def my_orders(user: dict = Depends(get_current_user)):
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return items


@api_router.get("/orders", response_model=List[Order])
async def all_orders(_admin: dict = Depends(get_admin_user)):
    items = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return items


# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"message": "EV Mart API is running"}


# ---------- Seed Data ----------
SEED_PRODUCTS = [
    {
        "name": "Aero EV1",
        "tagline": "The everyday commuter, reimagined.",
        "price": 89999,
        "original_price": 99999,
        "battery": "2.9 kWh",
        "range_km": 115,
        "top_speed": 65,
        "charging_time": "4.5 hrs",
        "motor": "4000W BLDC Hub",
        "colors": ["Pearl White", "Jet Black", "Ocean Blue"],
        "image": "https://images.unsplash.com/photo-1607091083645-31f4e28dc9af?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGV8ZW58MHx8fHwxNzc2NDAzODgxfDA&ixlib=rb-4.1.0&q=85",
        "gallery": [],
        "stock": 25,
        "featured": True,
        "description": "A silent, smart and sustainable ride built for daily city use. The Aero EV1 pairs a crisp digital console with regenerative braking and app-connected telemetry.",
    },
    {
        "name": "Velocity X",
        "tagline": "Performance meets zero emission.",
        "price": 139999,
        "original_price": 149999,
        "battery": "4.0 kWh",
        "range_km": 150,
        "top_speed": 95,
        "charging_time": "5 hrs",
        "motor": "7000W Mid-Drive",
        "colors": ["Racing Red", "Stealth Black"],
        "image": "https://images.unsplash.com/photo-1623079399942-368de709ea32?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGV8ZW58MHx8fHwxNzc2NDAzODgxfDA&ixlib=rb-4.1.0&q=85",
        "gallery": [],
        "stock": 12,
        "featured": True,
        "description": "Thrilling acceleration, razor-sharp handling and premium finish. Velocity X is engineered for riders who refuse to compromise on speed even when going green.",
    },
    {
        "name": "EcoRider Pro",
        "tagline": "Go further, ride greener.",
        "price": 109999,
        "original_price": 119999,
        "battery": "3.5 kWh",
        "range_km": 140,
        "top_speed": 80,
        "charging_time": "4 hrs",
        "motor": "5500W BLDC",
        "colors": ["Forest Green", "Matte Grey"],
        "image": "https://images.unsplash.com/photo-1623079400394-f07956928c3f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGV8ZW58MHx8fHwxNzc2NDAzODgxfDA&ixlib=rb-4.1.0&q=85",
        "gallery": [],
        "stock": 18,
        "featured": True,
        "description": "Built tough for mixed terrain commutes. EcoRider Pro combines a rugged aluminium frame with IP67 weatherproof electronics for worry-free riding.",
    },
    {
        "name": "City Glide",
        "tagline": "Minimal, magnetic, electric.",
        "price": 74999,
        "original_price": 82999,
        "battery": "2.2 kWh",
        "range_km": 90,
        "top_speed": 55,
        "charging_time": "3.5 hrs",
        "motor": "3000W Hub",
        "colors": ["Urban Black", "Sand Beige"],
        "image": "https://images.unsplash.com/photo-1696327461171-2b341c349c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwyfHxlbGVjdHJpYyUyMHNjb290ZXIlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc2NDAzODc3fDA&ixlib=rb-4.1.0&q=85",
        "gallery": [],
        "stock": 40,
        "featured": False,
        "description": "Lightweight, compact and ideal for campus and inner-city rides. A minimalist design that slips through traffic and turns heads with equal ease.",
    },
    {
        "name": "Urban Bolt",
        "tagline": "The smart ride of tomorrow, today.",
        "price": 99999,
        "original_price": 108999,
        "battery": "3.0 kWh",
        "range_km": 120,
        "top_speed": 75,
        "charging_time": "4 hrs",
        "motor": "4500W BLDC",
        "colors": ["Electric Blue", "Pure White"],
        "image": "https://images.unsplash.com/photo-1675273672378-1b8e4de84dca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJpYyUyMHNjb290ZXIlMjBpc29sYXRlZHxlbnwwfHx8fDE3NzY0MDM4NjF8MA&ixlib=rb-4.1.0&q=85",
        "gallery": [],
        "stock": 22,
        "featured": True,
        "description": "Smart connectivity, OTA updates and keyless start. Urban Bolt is a connected EV that learns your routes and optimises battery use automatically.",
    },
]


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@evmart.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Admin",
            "role": "admin",
            "password_hash": hash_password(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}},
        )


async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    now = datetime.now(timezone.utc).isoformat()
    docs = []
    for p in SEED_PRODUCTS:
        docs.append({"id": str(uuid.uuid4()), "created_at": now, **p})
    await db.products.insert_many(docs)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.orders.create_index("user_id")
    await seed_admin()
    await seed_products()


# Register router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
