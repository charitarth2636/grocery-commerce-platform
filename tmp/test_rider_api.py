import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_rider_api():
    print("--- Testing Rider API ---")
    
    # 1. Login as Admin
    # Assuming standard admin credentials for dev
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@example.com",
        "password": "password123"
    })
    
    if login_res.status_code != 200:
        print(f"FAILED: Admin login failed ({login_res.status_code})")
        return
    
    token = login_res.json().get("data", {}).get("accessToken")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Test Get Riders (role=delivery_partner)
    riders_res = requests.get(f"{BASE_URL}/admin/users?role=delivery_partner", headers=headers)
    if riders_res.status_code == 200:
        riders = riders_res.json().get("data", [])
        print(f"SUCCESS: Fetched {len(riders)} riders")
        for r in riders:
            if r.get("role") != "delivery_partner":
                print(f"FAILED: Rider {r['name']} has incorrect role {r['role']}")
    else:
        print(f"FAILED: Get riders failed ({riders_res.status_code})")

    # 3. Test Get Customers (role=customer)
    customers_res = requests.get(f"{BASE_URL}/admin/users?role=customer", headers=headers)
    if customers_res.status_code == 200:
        customers = customers_res.json().get("data", [])
        print(f"SUCCESS: Fetched {len(customers)} customers")
    else:
        print(f"FAILED: Get customers failed ({customers_res.status_code})")

if __name__ == "__main__":
    test_rider_api()
