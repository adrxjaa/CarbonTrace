import hashlib

def generate_image_hash(image_bytes):
    return hashlib.sha256(image_bytes).hexdigest()