import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import EMAIL_CONFIG

class EmailService:
    @staticmethod
    def send_verification_email(to_email: str, code: str) -> bool:
        """
        Sends a 6-digit verification code to the user via SMTP.
        Returns True if successful, False otherwise.
        """
        smtp_server = EMAIL_CONFIG.get("smtp_server")
        smtp_port = EMAIL_CONFIG.get("smtp_port")
        smtp_email = EMAIL_CONFIG.get("smtp_email")
        smtp_password = EMAIL_CONFIG.get("smtp_password")
        
        # If credentials are not configured, fallback to printing to console securely and raising a warning 
        if not smtp_email or not smtp_password:
            print(f"\n[WARNING] SMTP credentials not set. Mocking email delivery!")
            print(f"[MOCK EMAIL] To: {to_email} | Code: {code}\n")
            return True
            
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_email
            msg['To'] = to_email
            msg['Subject'] = "Verify your NutriVision Account"
            
            body = f"""
            Hello!
            
            Thank you for registering with NutriVision.
            Your 6-digit verification code is: {code}
            
            Please enter this code in the application to activate your account.
            
            Best regards,
            The NutriVision Team
            """
            msg.attach(MIMEText(body, 'plain'))
            
            # Connect to SMTP server
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            server.quit()
            
            print(f"✓ Verification email successfully sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"✗ Failed to send verification email to {to_email}: {str(e)}")
            return False
