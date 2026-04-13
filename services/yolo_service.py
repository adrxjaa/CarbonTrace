from ultralytics import YOLO
import numpy as np
import cv2

model = YOLO("yolov8n.pt")

def detect_objects(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(img)
    return results[0].boxes.cls.tolist()