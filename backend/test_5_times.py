import urllib.request
import json
import time

for i in range(1, 6):
    username = f"tester_bulk_{i}"
    # Plus addressing allows us to send 5 distinct emails that all arrive in the same master inbox!
    email = f"adityasingh314159+signup{i}@gmail.com"
    
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
        print(f"[{i}/5] Registering {username} with {email} ...")
        
        # Start a timer to see if it takes too long
        start = time.time()
        res = urllib.request.urlopen(req)
        response_data = res.read().decode()
        end = time.time()
        
        print(f"   => Success! Received: {response_data} (Took: {end-start:.2f}s)")
        
    except Exception as e:
        print(f"   => ERROR! {str(e)}")
        
    time.sleep(1) # Sleep to avoid slamming the dev server instantly
