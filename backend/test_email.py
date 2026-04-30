from app.services.email_service import EmailService

try:
    print("Sending email...")
    success = EmailService.send_verification_email("adityasingh314159@gmail.com", "999999")
    print("Success returned:", success)
except Exception as e:
    print("ERROR:", str(e))
