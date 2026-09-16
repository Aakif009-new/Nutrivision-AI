import os
import zipfile
import shutil
import argparse


def extract_and_prepare_dataset(zip_path: str, target_dir: str = "ml/dataset"):
    """
    Extracts a custom dataset ZIP file and organizes images & YOLO format text labels into train/val split folders.
    """
    if not os.path.exists(zip_path):
        print(f"Error: Zip file not found at path '{zip_path}'")
        return False

    print(f"Extracting '{zip_path}' to '{target_dir}'...")
    os.makedirs(target_dir, exist_ok=True)
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(target_dir)

    # Structure check and directory verification
    train_img_dir = os.path.join(target_dir, "images", "train")
    val_img_dir = os.path.join(target_dir, "images", "val")
    train_lbl_dir = os.path.join(target_dir, "labels", "train")
    val_lbl_dir = os.path.join(target_dir, "labels", "val")

    os.makedirs(train_img_dir, exist_ok=True)
    os.makedirs(val_img_dir, exist_ok=True)
    os.makedirs(train_lbl_dir, exist_ok=True)
    os.makedirs(val_lbl_dir, exist_ok=True)

    print("Dataset directory structure organized successfully!")
    print(f"  -> Images (Train): {train_img_dir}")
    print(f"  -> Images (Val):   {val_img_dir}")
    print(f"  -> Labels (Train): {train_lbl_dir}")
    print(f"  -> Labels (Val):   {val_lbl_dir}")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NutriVision AI Dataset Preparation Utility")
    parser.add_argument("--zip", type=str, required=True, help="Path to your dataset zip file")
    parser.add_argument("--output", type=str, default="ml/dataset", help="Target extraction directory")
    args = parser.parse_args()

    extract_and_prepare_dataset(args.zip, args.output)
