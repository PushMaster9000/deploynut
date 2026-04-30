
import bcrypt

def test_logic():
    # Simulate the logic now in AuthService
    password = "a" * 100
    pw_bytes = password.encode('utf-8')[:72]
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pw_bytes, salt)
    hashed_str = hashed.decode('utf-8')
    
    print(f"Hashed string: {hashed_str}")
    
    # Verify
    verify_bytes = password.encode('utf-8')[:72]
    result = bcrypt.checkpw(verify_bytes, hashed_str.encode('utf-8'))
    print(f"Verification result: {result}")

if __name__ == "__main__":
    test_logic()
