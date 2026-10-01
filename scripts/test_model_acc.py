import glob
from pathlib import Path
import cv2
import sys
import numpy as np

backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from ml.food_classifier.hybrid_classifier import hybrid_food_classifier
from ml.food_classifier.inference import FoodClassifierInferenceEngine

cnn_engine = FoodClassifierInferenceEngine()

classes = ['apple', 'banana', 'orange', 'strawberry', 'bitter_gourd', 'capsicum', 'cucumber', 'okra', 'potato', 'tomato']

print(f"{'Class':<15} | {'CNN Correct':<12} | {'Hybrid Correct':<14} | {'Total'}")
print("-" * 50)

total_cnn_corr = 0
total_hyb_corr = 0
total_imgs = 0

for cls in classes:
    imgs = glob.glob(f"datasets/classification/test/{cls}_*/*.*")
    if not imgs:
        imgs = glob.glob(f"datasets/classification/train/{cls}_*/*.*")[:15]
    
    cnn_corr = 0
    hyb_corr = 0
    total = len(imgs)
    
    for p in imgs:
        bgr = cv2.imread(p)
        if bgr is None: continue
        c_res = cnn_engine.predict(bgr)
        h_res = hybrid_food_classifier.classify_crop(bgr)
        
        c_pred = c_res.get("raw_class", "").lower()
        h_pred = h_res.get("raw_class", "").lower()
        
        if c_pred == cls.lower(): cnn_corr += 1
        if h_pred == cls.lower(): hyb_corr += 1
        
    print(f"{cls:<15} | {cnn_corr:<12} | {hyb_corr:<14} | {total}")
    total_cnn_corr += cnn_corr
    total_hyb_corr += hyb_corr
    total_imgs += total

print("-" * 50)
print(f"Overall Accuracy: CNN: {total_cnn_corr/total_imgs:.2%} | Hybrid: {total_hyb_corr/total_imgs:.2%}")
