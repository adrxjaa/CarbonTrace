import pytesseract
from PIL import Image
import io

def extract_text(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    return pytesseract.image_to_string(image)