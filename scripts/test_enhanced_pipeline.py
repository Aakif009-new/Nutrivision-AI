import os
import sys
from pathlib import Path
import cv2
import json

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.api.v1.food_analysis import run_full_pipeline

def test_samples():
    project_root = Path(__file__).resolve().parent.parent
    test_dir = project_root / "datasets" / "classification" / "test"

    print("=" * 70)
    print("NUTRIVISION AI — CASCADE CLASSIFICATION PIPELINE TEST")
    print("=" * 70)

    sample_classes = [
        "tomato_fresh",
        "tomato_rotten",
        "strawberry_fresh",
        "strawberry_rotten",
        "apple_fresh",
        "apple_rotten",
        "potato_fresh",
        "potato_rotten",
        "banana_fresh",
        "orange_fresh"
    ]

    for cname in sample_classes:
        cfolder = test_dir / cname
        if not cfolder.exists():
            continue

        images = list(cfolder.glob("*.jpg")) + list(cfolder.glob("*.png"))
        if not images:
            continue

        img_path = images[0]
        img = cv2.imread(str(img_path))
        if img is None:
            continue

        res = run_full_pipeline(img)
        dets = res.get("detections", [])
        valid = [d for d in dets if d.get("is_supported", False)]

        print(f"\n[Test Item] {cname} ({img_path.name})")
        if valid:
            for v in valid:
                print(f"  --> Identified Food: {v['food']} ({v['confidence']:.1%}) | Freshness: {v['freshness']} ({v.get('freshness_confidence', 0):.1%}) | Weight: {v['weight']['estimated_weight_grams']}g | Spoilage: {v['spoilage']['spoiled_area_percentage']}%")
        else:
            print(f"  --> Undefined / Rejected: {dets[0].get('reason', 'N/A')}")

if __name__ == "__main__":
    test_samples()
