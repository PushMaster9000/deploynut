import bcrypt

def test_bcrypt_direct():
    password = "a" * 10
    password_bytes = password.encode('utf-8')
    print(f"Testing bcrypt direct with {len(password_bytes)} bytes")
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        print("Bcrypt direct successful")
    except Exception as e:
        print(f"Bcrypt direct failed: {e}")

if __name__ == "__main__":
    test_bcrypt_direct()
