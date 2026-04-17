"""
EVMart Backend API Tests
Tests for: Products, Auth, Orders endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@evmart.com"
ADMIN_PASSWORD = "admin123"

# Expected seeded products
EXPECTED_PRODUCTS = ["Aero EV1", "Velocity X", "EcoRider Pro", "City Glide", "Urban Bolt"]


class TestHealthAndProducts:
    """Test health check and product endpoints"""
    
    def test_api_health(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API health check passed: {data['message']}")
    
    def test_get_all_products(self):
        """Test GET /api/products returns 5 seeded EV scooters"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        # Should have 5 products
        assert len(products) >= 5, f"Expected at least 5 products, got {len(products)}"
        
        # Check all expected products exist
        product_names = [p["name"] for p in products]
        for expected in EXPECTED_PRODUCTS:
            assert expected in product_names, f"Missing product: {expected}"
        
        # Verify no _id field leaks
        for p in products:
            assert "_id" not in p, f"MongoDB _id leaked in product: {p.get('name')}"
        
        print(f"✓ GET /api/products returned {len(products)} products")
    
    def test_get_single_product(self):
        """Test GET /api/products/{id} returns product with all fields"""
        # First get all products to get an ID
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        
        product_id = products[0]["id"]
        
        # Get single product
        response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        product = response.json()
        
        # Verify all required fields exist
        required_fields = ["id", "name", "tagline", "price", "battery", "range_km", 
                          "top_speed", "charging_time", "motor", "colors", "image", "description"]
        for field in required_fields:
            assert field in product, f"Missing field: {field}"
        
        # Verify no _id field
        assert "_id" not in product
        
        print(f"✓ GET /api/products/{product_id} returned product: {product['name']}")
    
    def test_get_nonexistent_product(self):
        """Test GET /api/products/{id} returns 404 for non-existent product"""
        response = requests.get(f"{BASE_URL}/api/products/nonexistent-id-12345")
        assert response.status_code == 404
        print("✓ GET non-existent product returns 404")


class TestAuth:
    """Test authentication endpoints"""
    
    def test_admin_login_success(self):
        """Test POST /api/auth/login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert len(data["token"]) > 0
        
        # Verify no _id field
        assert "_id" not in data["user"]
        
        print(f"✓ Admin login successful, role: {data['user']['role']}")
        return data["token"]
    
    def test_login_wrong_password(self):
        """Test POST /api/auth/login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword123"
        })
        assert response.status_code == 401
        print("✓ Login with wrong password returns 401")
    
    def test_login_nonexistent_user(self):
        """Test POST /api/auth/login with non-existent user returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })
        assert response.status_code == 401
        print("✓ Login with non-existent user returns 401")
    
    def test_register_new_user(self):
        """Test POST /api/auth/register creates new user"""
        timestamp = int(time.time())
        test_email = f"TEST_user_{timestamp}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": test_email,
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == test_email.lower()
        assert data["user"]["role"] == "customer"
        assert data["user"]["name"] == "Test User"
        
        # Verify no _id field
        assert "_id" not in data["user"]
        
        print(f"✓ User registration successful: {test_email}")
        return data["token"], test_email
    
    def test_register_duplicate_email(self):
        """Test POST /api/auth/register with existing email returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Duplicate User",
            "email": ADMIN_EMAIL,
            "password": "testpass123"
        })
        assert response.status_code == 400
        print("✓ Register with duplicate email returns 400")
    
    def test_get_me_with_token(self):
        """Test GET /api/auth/me returns current user when token provided"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Get current user
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        user = response.json()
        
        assert user["email"] == ADMIN_EMAIL
        assert user["role"] == "admin"
        assert "_id" not in user
        
        print(f"✓ GET /api/auth/me returned user: {user['email']}")
    
    def test_get_me_without_token(self):
        """Test GET /api/auth/me returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ GET /api/auth/me without token returns 401")


class TestAdminProductOperations:
    """Test admin-only product CRUD operations"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture
    def customer_token(self):
        """Get customer token"""
        timestamp = int(time.time())
        test_email = f"TEST_customer_{timestamp}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Customer",
            "email": test_email,
            "password": "testpass123"
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_create_product_without_token(self):
        """Test POST /api/products returns 401 without token"""
        response = requests.post(f"{BASE_URL}/api/products", json={
            "name": "Test Scooter",
            "tagline": "Test tagline",
            "price": 50000,
            "battery": "2.0 kWh",
            "range_km": 80,
            "top_speed": 50,
            "charging_time": "3 hrs",
            "motor": "3000W",
            "image": "https://example.com/image.jpg",
            "description": "Test description"
        })
        assert response.status_code == 401
        print("✓ POST /api/products without token returns 401")
    
    def test_create_product_with_customer_token(self, customer_token):
        """Test POST /api/products returns 403 with customer token"""
        response = requests.post(f"{BASE_URL}/api/products", json={
            "name": "Test Scooter",
            "tagline": "Test tagline",
            "price": 50000,
            "battery": "2.0 kWh",
            "range_km": 80,
            "top_speed": 50,
            "charging_time": "3 hrs",
            "motor": "3000W",
            "image": "https://example.com/image.jpg",
            "description": "Test description"
        }, headers={"Authorization": f"Bearer {customer_token}"})
        assert response.status_code == 403
        print("✓ POST /api/products with customer token returns 403")
    
    def test_create_product_with_admin_token(self, admin_token):
        """Test POST /api/products succeeds with admin token"""
        timestamp = int(time.time())
        response = requests.post(f"{BASE_URL}/api/products", json={
            "name": f"TEST_Scooter_{timestamp}",
            "tagline": "Test tagline",
            "price": 50000,
            "battery": "2.0 kWh",
            "range_km": 80,
            "top_speed": 50,
            "charging_time": "3 hrs",
            "motor": "3000W",
            "image": "https://example.com/image.jpg",
            "description": "Test description"
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        product = response.json()
        
        assert product["name"] == f"TEST_Scooter_{timestamp}"
        assert "_id" not in product
        
        print(f"✓ POST /api/products with admin token created: {product['name']}")
        return product["id"]
    
    def test_update_product_admin_only(self, admin_token):
        """Test PUT /api/products/{id} is admin-only"""
        # Get a product ID
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        # Try without token
        response = requests.put(f"{BASE_URL}/api/products/{product_id}", json={
            "name": "Updated Name",
            "tagline": products[0]["tagline"],
            "price": products[0]["price"],
            "battery": products[0]["battery"],
            "range_km": products[0]["range_km"],
            "top_speed": products[0]["top_speed"],
            "charging_time": products[0]["charging_time"],
            "motor": products[0]["motor"],
            "image": products[0]["image"],
            "description": products[0]["description"]
        })
        assert response.status_code == 401
        print("✓ PUT /api/products without token returns 401")
    
    def test_delete_product_admin_only(self, admin_token):
        """Test DELETE /api/products/{id} is admin-only"""
        # First create a product to delete
        timestamp = int(time.time())
        create_response = requests.post(f"{BASE_URL}/api/products", json={
            "name": f"TEST_ToDelete_{timestamp}",
            "tagline": "To be deleted",
            "price": 10000,
            "battery": "1.0 kWh",
            "range_km": 50,
            "top_speed": 40,
            "charging_time": "2 hrs",
            "motor": "2000W",
            "image": "https://example.com/delete.jpg",
            "description": "Will be deleted"
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        
        # Try delete without token
        response = requests.delete(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 401
        print("✓ DELETE /api/products without token returns 401")
        
        # Delete with admin token
        response = requests.delete(f"{BASE_URL}/api/products/{product_id}", 
                                   headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        print("✓ DELETE /api/products with admin token succeeds")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert get_response.status_code == 404
        print("✓ Deleted product returns 404")


class TestOrders:
    """Test order endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture
    def customer_token_and_email(self):
        """Get customer token and email"""
        timestamp = int(time.time())
        test_email = f"TEST_ordercustomer_{timestamp}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Order Test Customer",
            "email": test_email,
            "password": "testpass123"
        })
        assert response.status_code == 200
        return response.json()["token"], test_email
    
    def test_create_order_requires_auth(self):
        """Test POST /api/orders requires authentication"""
        response = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": "test", "name": "Test", "price": 1000, "quantity": 1, "image": "test.jpg"}],
            "full_name": "Test User",
            "phone": "1234567890",
            "address": "Test Address",
            "city": "Test City",
            "pincode": "123456"
        })
        assert response.status_code == 401
        print("✓ POST /api/orders without token returns 401")
    
    def test_create_order_success(self, customer_token_and_email):
        """Test POST /api/orders creates order with correct total"""
        token, email = customer_token_and_email
        
        # Get a real product
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product = products[0]
        
        # Create order
        response = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [{
                "product_id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": 2,
                "image": product["image"]
            }],
            "full_name": "Test Customer",
            "phone": "9876543210",
            "address": "123 Test Street",
            "city": "Mumbai",
            "pincode": "400001"
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 200
        order = response.json()
        
        # Verify order structure
        assert "id" in order
        assert order["user_email"] == email.lower()
        assert order["total"] == product["price"] * 2
        assert order["status"] == "Confirmed"
        assert "_id" not in order
        
        print(f"✓ Order created with total: {order['total']}")
        return order["id"], token
    
    def test_get_my_orders(self, customer_token_and_email):
        """Test GET /api/orders/me returns only current user's orders"""
        token, email = customer_token_and_email
        
        # First create an order
        products_response = requests.get(f"{BASE_URL}/api/products")
        product = products_response.json()[0]
        
        requests.post(f"{BASE_URL}/api/orders", json={
            "items": [{
                "product_id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": 1,
                "image": product["image"]
            }],
            "full_name": "My Orders Test",
            "phone": "1111111111",
            "address": "Test Address",
            "city": "Delhi",
            "pincode": "110001"
        }, headers={"Authorization": f"Bearer {token}"})
        
        # Get my orders
        response = requests.get(f"{BASE_URL}/api/orders/me", 
                               headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        orders = response.json()
        
        # All orders should belong to this user
        for order in orders:
            assert order["user_email"] == email.lower()
            assert "_id" not in order
        
        print(f"✓ GET /api/orders/me returned {len(orders)} orders for user")
    
    def test_get_all_orders_admin_only(self, admin_token, customer_token_and_email):
        """Test GET /api/orders (admin) returns all orders"""
        customer_token, _ = customer_token_and_email
        
        # Customer should get 403
        response = requests.get(f"{BASE_URL}/api/orders", 
                               headers={"Authorization": f"Bearer {customer_token}"})
        assert response.status_code == 403
        print("✓ GET /api/orders with customer token returns 403")
        
        # Admin should succeed
        response = requests.get(f"{BASE_URL}/api/orders", 
                               headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        orders = response.json()
        
        # Verify no _id leaks
        for order in orders:
            assert "_id" not in order
        
        print(f"✓ GET /api/orders (admin) returned {len(orders)} orders")
    
    def test_create_order_empty_cart(self, customer_token_and_email):
        """Test POST /api/orders with empty cart returns 400"""
        token, _ = customer_token_and_email
        
        response = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [],
            "full_name": "Empty Cart Test",
            "phone": "0000000000",
            "address": "Test",
            "city": "Test",
            "pincode": "000000"
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 400
        print("✓ POST /api/orders with empty cart returns 400")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
