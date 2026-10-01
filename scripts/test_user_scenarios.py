import sys
from pathlib import Path
import cv2
import numpy as np

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.api.v1.food_analysis import run_full_pipeline

def test_all():
    print("=" * 60)
    print("TESTING USER SCENARIOS & REJECTION LOGIC")
    print("=" * 60)

    # 1. Synthetic Human Selfie Image (Skin tone face + room)
    human_selfie = np.zeros((480, 640, 3), dtype=np.uint8)
    human_selfie[:, :] = [180, 150, 130] # Room background
    # Add face with skin tone (BGR: ~ [120, 160, 220] -> RGB: ~ [220, 160, 120])
    cv2.circle(human_selfie, (320, 220), 100, (130, 170, 225), -1)
    cv2.rectangle(human_selfie, (200, 320), (440, 480), (140, 180, 230), -1)

    res_human = run_full_pipeline(human_selfie)
    det_human = res_human["detections"][0]
    print(f"\n[Scenario 1: Human Selfie/Person]")
    print(f"  Result: {det_human['food']} ({det_human['confidence']:.0%}) | Supported: {det_human['is_supported']}")
    print(f"  Reason: {det_human.get('reason')}")

    # 2. Synthetic Banana on Pink Sheet (Yellow Banana on Pink Background)
    banana_on_pink = np.zeros((480, 640, 3), dtype=np.uint8)
    banana_on_pink[:, :] = [180, 130, 240] # Pink sheet background
    # Draw curved yellow banana (BGR: ~ [40, 210, 240])
    pts = np.array([[280, 80], [330, 160], [350, 260], [330, 360], [280, 420], [300, 420], [360, 340], [380, 240], [350, 140], [290, 80]], np.int32)
    cv2.fillPoly(banana_on_pink, [pts], (35, 215, 245))

    res_banana = run_full_pipeline(banana_on_pink)
    valid_b = [d for d in res_banana["detections"] if d.get("is_supported")]
    print(f"\n[Scenario 2: Banana on Pink Sheet]")
    for v in valid_b:
        print(f"  Result: {v['food']} ({v['confidence']:.1%}) | Freshness: {v['freshness']}")

    # 3. Synthetic Green Cucumber on White Background
    cuke_on_white = np.ones((480, 640, 3), dtype=np.uint8) * 255 # White background
    # Draw green elongated cucumber (BGR: ~ [40, 160, 40])
    cv2.ellipse(cuke_on_white, (320, 240), (180, 45), 0, 0, 360, (45, 155, 45), -1)

    res_cuke = run_full_pipeline(cuke_on_white)
    valid_c = [d for d in res_cuke["detections"] if d.get("is_supported")]
    print(f"\n[Scenario 3: Cucumber on White Background]")
    for v in valid_c:
        print(f"  Result: {v['food']} ({v['confidence']:.1%}) | Freshness: {v['freshness']}")

    # 4. Real Dataset Images
    for cls in ["tomato_fresh", "strawberry_fresh", "potato_fresh", "orange_fresh", "apple_fresh"]:
        p = list(Path("datasets/classification/test").glob(f"{cls}/*.*"))[0]
        img = cv2.imread(str(p))
        res = run_full_pipeline(img)
        v_list = [d for d in res["detections"] if d.get("is_supported")]
        print(f"\n[Scenario 4: Real Dataset - {cls}]")
        for v in v_list:
            print(f"  Result: {v['food']} ({v['confidence']:.1%}) | Freshness: {v['freshness']} ({v['freshness_confidence']:.1%})")

if __name__ == "__main__":
    test_all()
