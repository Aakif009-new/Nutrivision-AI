import os
import sys
from pathlib import Path
import cv2
import json
import numpy as np

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.api.v1.food_analysis import run_full_pipeline

def test_pipeline_on_dataset():
    project_root = Path(__file__).resolve().parent.parent
    test_dir = project_root / "datasets" / "classification" / "test"
    
    print("=" * 70)
    print("NUTRIVISION AI — COMPREHENSIVE PIPELINE VERIFICATION TEST")
    print("Testing scratch trained YOLO11 + Freshness CNN + Weight Regressor")
    print("=" * 70)

    if not test_dir.exists():
        print(f"Error: Test dataset directory not found at {test_dir}")
        return

    # Pick 1 sample image from each class folder
    tested_count = 0
    success_count = 0

    for class_folder in sorted(test_dir.iterdir()):
        if not class_folder.is_dir():
            continue

        images = list(class_folder.glob("*.jpg")) + list(class_folder.glob("*.png"))
        if not images:
            continue

        test_img_path = images[0]
        img_bgr = cv2.imread(str(test_img_path))
        if img_bgr is None:
            continue

        res = run_full_pipeline(img_bgr)
        dets = res.get("detections", [])
        valid_dets = [d for d in dets if d.get("is_supported", False)]

        tested_count += 1
        print(f"\n[Test #{tested_count}] Folder: {class_folder.name} -> File: {test_img_path.name}")
        
        if valid_dets:
            for d in valid_dets:
                print(f"  --> Recognized: {d['food']} ({d['confidence']:.1%}) | Freshness: {d['freshness']} ({d.get('freshness_confidence', 0):.1%}) | Size: {d['size']['text']} | Weight: {d['weight']['estimated_weight_grams']}g | Spoilage: {d['spoilage']['spoiled_area_percentage']}%")
            success_count += 1
        else:
            print(f"  --> Returned: {dets[0].get('food', 'Undefined')} (Reason: {dets[0].get('reason', 'N/A')})")

    # TEST NON-FOOD / PERSON / BACKGROUND SYNTHETIC IMAGE
    print("\n" + "-" * 70)
    print("[Test Non-Food / Background Rejection]")
    synthetic_non_food = np.random.randint(50, 180, (480, 640, 3), dtype=np.uint8)
    # Add some random lines
    cv2.line(synthetic_non_food, (100, 100), (500, 400), (255, 0, 0), 5)
    cv2.rectangle(synthetic_non_food, (200, 200), (400, 350), (0, 255, 0), 4)
    
    non_food_res = run_full_pipeline(synthetic_non_food)
    non_food_dets = non_food_res.get("detections", [])
    print(f"  --> Non-Food Input Output: {[d.get('food') for d in non_food_dets]}")
    if all(not d.get("is_supported", False) for d in non_food_dets):
        print("  --> PASS: Synthetic non-food successfully rejected as 'Undefined'!")
    else:
        print("  --> FAIL: Non-food was incorrectly classified.")

    print("\n" + "=" * 70)
    print(f"PIPELINE TEST SUMMARY: {success_count}/{tested_count} food classes detected and analyzed.")
    print("=" * 70)

if __name__ == "__main__":
    test_pipeline_on_dataset()
