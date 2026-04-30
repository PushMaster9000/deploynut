import urllib.request
import json
import time
from app.database import connect_db

# 1. Delete all users from the database
print("Connecting to database to clear users...")
db = connect_db()
users_collection = db["users"]
deleted_count = users_collection.delete_many({}).deleted_count
print(f"✓ Removed {deleted_count} users from the database.")

# 2. Sign up with the two specific accounts
emails = [
    "subhashchandrasingh456@gmail.com",
    "adityasingh314159@gmail.com"
]

for i, email in enumerate(emails):
    username = email.split("@")[0] # Use the email prefix as username
    
    data = json.dumps({
        "username": username,
        "email": email,
        "password": "SecurePassword123!"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8000/api/auth/signup", 
        method="POST", 
        data=data, 
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        print(f"\nRegistering {username} with {email} ...")
        res = urllib.request.urlopen(req)
        response_data = res.read().decode()
        print(f"✓ Success! Received: {response_data}")
    except Exception as e:
        print(f"✗ ERROR! {str(e)}")
        if hasattr(e, 'read'):
            print(e.read().decode())
    
    time.sleep(2) # Give SMTP connection a moment to breathe
