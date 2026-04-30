"""
Image utilities for handling image uploads and validation.
This module gracefully handles missing PIL/Pillow dependencies.
"""

import base64
from typing import Optional
import io

# Try to import PIL, but make it optional
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("⚠ Warning: PIL/Pillow not available. Image validation/processing disabled.")


def validate_base64_image(image_base64: str) -> bool:
    """
    Validate if the provided string is a valid base64 encoded image.
    
    Args:
        image_base64: Base64 encoded image string
    
    Returns:
        bool: True if valid, False otherwise (or True if PIL not available)
    """
    if not PIL_AVAILABLE:
        # If PIL is not available, assume valid (don't block on missing dependency)
        return bool(image_base64)
    
    try:
        if not image_base64:
            return False
        
        # Try to decode and open as image
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        img.verify()
        return True
    except Exception as e:
        print(f"Image validation error: {e}")
        return False


def get_image_format(image_base64: str) -> Optional[str]:
    """
    Detect the format of base64 encoded image.
    
    Args:
        image_base64: Base64 encoded image string
    
    Returns:
        str: Image format (JPEG, PNG, etc.) or None if invalid or PIL unavailable
    """
    if not PIL_AVAILABLE:
        return None
    
    try:
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        return img.format
    except Exception as e:
        print(f"Error detecting image format: {e}")
        return None


def process_image(image_base64: str, target_size: tuple = (224, 224)) -> Optional[bytes]:
    """
    Process base64 image: decode, resize, and return as bytes.
    
    Args:
        image_base64: Base64 encoded image string
        target_size: Target size for resizing (width, height)
    
    Returns:
        bytes: Processed image bytes or None if processing fails or PIL unavailable
    """
    if not PIL_AVAILABLE:
        return None
    
    try:
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        img = img.convert("RGB")  # Ensure RGB format
        img = img.resize(target_size)
        
        # Convert back to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        return img_bytes.getvalue()
    except Exception as e:
        print(f"Error processing image: {e}")
        return None
