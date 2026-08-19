# College Inspector AI - Computer/Monitor Detection Model

## Model
YOLOv8s

## Purpose
Detects computer monitors in classroom/laboratory CCTV footage for
computer-equipment inventory checks, as part of the College Inspector
AI SIH prototype's Visual Inspection Pipeline.

## Classes
| ID | Class   |
|----|---------|
| 0  | Monitor |

## Recommended Inference Settings
Image Size: 1280
Confidence: 0.08
IoU: 0.30

Note: confidence is set low deliberately. Small/distant monitors in wide
lab shots score low confidence even when correctly detected; a missed
monitor (false negative) is worse for inspection purposes than an extra
box a human reviewer can dismiss.

## YOLO CLI
yolo detect predict \
    model="computer_monitor_detection_yolov8s_best.pt" \
    source="image.jpg" \
    imgsz=1280 \
    conf=0.08 \
    iou=0.30 \
    save=True

## Python
from ultralytics import YOLO
model = YOLO("computer_monitor_detection_yolov8s_best.pt")
results = model.predict(
    source="image.jpg",
    imgsz=1280,
    conf=0.08,
    iou=0.30
)
for result in results:
    if result.boxes is not None:
        print(result.boxes.cls)
        print(result.boxes.conf)

## Output
The model provides:
1. Bounding boxes
2. Class ID (Monitor)
3. Confidence scores

## Training Data
Trained on the "Computer Lab Equipment Detection" dataset (Roboflow
Universe, carldatans-workspace), filtered to the Monitor class only
(2,576 source images, 1,805 used for training after filtering).

## Validation Metrics
mAP50: 0.976
mAP50-95: 0.823
Precision: 0.955
Recall: 0.958
(Metrics from validation split; real-world wide-angle classroom testing
showed lower recall on small/distant monitors, hence the lowered
inference confidence above.)

## Environment
Python 3.12
Ultralytics 8.4.122
PyTorch 2.11.0+cu128

## Important
This model is intended for the SIH prototype. It should not be treated
as a certified equipment-inventory verification system without human
review, in line with the project's human-in-the-loop design.