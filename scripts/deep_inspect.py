import os
import sys
from pathlib import Path

def deep_inspect(dataset_path: str):
    p = Path(dataset_path)
    print("=" * 60)
    print(f"DEEP SUBDIRECTORY INSPECTION: {dataset_path}")
    print("=" * 60)

    for split in ["train", "val", "test", "metadata"]:
        split_path = p / split
        if split_path.exists():
            print(f"\n--- [{split.upper()}] ---")
            children = list(split_path.iterdir())
            dirs = [c for c in children if c.is_dir()]
            files = [c for c in children if c.is_file()]
            print(f"Subdirectories ({len(dirs)}): {[d.name for d in dirs]}")
            print(f"Files ({len(files)}): {[f.name for f in files]}")

            if dirs:
                print("Class sample counts:")
                for d in dirs:
                    count = len(list(d.glob("*.*")))
                    print(f"  - {d.name}: {count} files")
            elif files:
                for f in files[:5]:
                    print(f"  - File: {f.name} (size {f.stat().st_size} bytes)")
                    if f.suffix.lower() in [".txt", ".json", ".csv", ".yaml", ".yml", ".md"]:
                        try:
                            with open(f, "r", encoding="utf-8", errors="ignore") as fh:
                                print(f"    Sample content:\n{fh.read()[:500]}")
                        except Exception as e:
                            print(f"    Error reading file: {e}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Mohamed Hannan\Downloads\NUTRIVISION AI PROJECT DATASET"
    deep_inspect(target)
