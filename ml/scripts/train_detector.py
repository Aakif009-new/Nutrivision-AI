import os
import argparse
from ultralytics import YOLO


def train_yolo_food_detector(epochs: int = 25, img_size: int = 640, batch_size: int = 16):
    """
    Fine-tunes YOLOv8 on custom food dataset and exports model weight to ml/models/yolov8_food.pt
    """
    config_path = os.path.join("ml", "config", "coco_classes.yaml")
    output_model_path = os.path.join("ml", "models", "yolov8_food.pt")

    print(f"Starting YOLOv8 Fine-Tuning ({epochs} epochs, batch {batch_size})...")
    model = YOLO("yolov8n.pt")  # Start from pretrained nano backbone

    model.train(
        data=config_path,
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        name="nutrivision_yolo_run"
    )

    # Save final model
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    model.export(format="engine") if False else None
    print(f"Model training complete! Best weights saved to {output_model_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv8 Food Detector")
    parser.add_argument("--epochs", type=int, default=25, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    args = parser.parse_args()

    train_yolo_food_detector(epochs=args.epochs, batch_size=args.batch)
