import requests
import uuid
import sys

email = f'test_{uuid.uuid4().hex[:6]}@example.com'
print('Registering', email)
reg_res = requests.post('http://localhost:8000/api/auth/signup', json={'name': 'Test User', 'email': email, 'phone': '9999999999', 'password': 'password123'})
token = reg_res.json().get('data', {}).get('accessToken')
if not token:
    print('Register failed:', reg_res.text)
    sys.exit(1)

products_res = requests.get('http://localhost:8000/api/products')
products = products_res.json().get('data', [])

cart_res = requests.post('http://localhost:8000/api/cart/add', json={'productId': products[0]['id'], 'quantity': 1}, headers={'Authorization': f'Bearer {token}'})
print('Cart:', cart_res.text)

order_payload = {'items': [{'productId': products[0]['id'], 'quantity': 1}], 'deliveryType': 'delivery', 'deliveryAddress': {'name': 'Test', 'phone': '99', 'address': '12', 'pincode': '11', 'addressType': 'home'}, 'paymentMethod': 'cod'}
order_res = requests.post('http://localhost:8000/api/orders', json=order_payload, headers={'Authorization': f'Bearer {token}'})
print('Order Check:', order_res.status_code, order_res.text)
