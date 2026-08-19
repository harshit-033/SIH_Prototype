# College Inspector AI - Defect Segmentation Model

## Model

YOLO11s-Seg

## Purpose

Structural defect detection and segmentation for the
College Inspector AI SIH prototype.

## Defect Classes

| ID | Class |
|----|-------|
| 0 | Crack |
| 1 | Spalling |
| 2 | Corrosion |
| 3 | Efflorescence |

## Recommended Inference Settings

Image Size: 1024
Confidence: 0.35
IoU: 0.30

## YOLO CLI

yolo segment predict \
    model="college_inspector_yolo11s_seg_best.pt" \
    source="image.jpg" \
    imgsz=1024 \
    conf=0.35 \
    iou=0.30 \
    save=True

## Python

from ultralytics import YOLO

model = YOLO("college_inspector_yolo11s_seg_best.pt")

results = model.predict(
    source="image.jpg",
    imgsz=1024,
    conf=0.35,
    iou=0.30
)

for result in results:

    if result.boxes is not None:
        print(result.boxes.cls)

    if result.masks is not None:
        print(result.masks)

## Output

The model provides:

1. Bounding boxes
2. Class IDs
3. Confidence scores
4. Segmentation masks

## Environment

Python 3.10
Ultralytics 8.4.121
PyTorch 2.9.1+cu130

## Important

This model is intended for the SIH prototype.
It should not be treated as a certified structural-safety
assessment system.