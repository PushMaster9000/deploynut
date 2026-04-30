import urllib.request
import json
import urllib.error

url = "http://localhost:8000/api/auth/signup"

req1 = urllib.request.Request(url, method="POST", data=json.dumps({
    "username": "tester99",
    "email": "tester99@example.com",
    "password": "Password123!"
}).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req1) as response:
        print("User 1 response:", response.status, response.read().decode())
except urllib.error.HTTPError as e:
    print("User 1 error:", e.code, e.read().decode())

req2 = urllib.request.Request(url, method="POST", data=json.dumps({
    "username": "tester99",
    "email": "tester99_other@example.com",
    "password": "Password123!"
}).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req2) as response:
        print("User 2 response:", response.status, response.read().decode())
except urllib.error.HTTPError as e:
    print("User 2 error:", e.code, e.read().decode())
