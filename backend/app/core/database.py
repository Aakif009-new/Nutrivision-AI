import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
from pathlib import Path

class DatabaseManager:
    """
    Academic Database Manager.
    Supports MongoDB via PyMongo when available, with persistent JSON file fallback.
    Manages collections: foods, nutrition, shelf_life, analysis_history, model_metrics.
    """

    def __init__(self):
        self.mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGODB_DB_NAME", "nutrivision_ai")
        self.client = None
        self.db = None
        self.is_connected = False
        
        # Local fallback directory
        self.fallback_dir = Path("backend/data")
        self.fallback_dir.mkdir(parents=True, exist_ok=True)
        
        self._init_connection()

    def _init_connection(self):
        try:
            from pymongo import MongoClient
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=2000)
            # Test connection
            self.client.server_info()
            self.db = self.client[self.db_name]
            self.is_connected = True
            print(f"[Database] Successfully connected to MongoDB at {self.mongo_uri}")
        except Exception as e:
            self.is_connected = False
            self.db = None
            print(f"[Database] MongoDB not reachable at {self.mongo_uri}. Utilizing local persistent storage.")

    def generate_scan_id(self) -> str:
        date_str = datetime.utcnow().strftime("%Y%m%d")
        # Count existing scans for today
        count = 1
        if self.is_connected and self.db is not None:
            try:
                count = self.db.analysis_history.count_documents({}) + 1
            except Exception:
                pass
        else:
            hist_file = self.fallback_dir / "analysis_history.json"
            if hist_file.exists():
                try:
                    with open(hist_file, "r") as f:
                        data = json.load(f)
                        count = len(data) + 1
                except Exception:
                    pass
        return f"NVA-{date_str}-{count:04d}"

    def save_analysis(self, record: Dict[str, Any]) -> str:
        scan_id = record.get("scan_id") or self.generate_scan_id()
        record_with_meta = {
            "scan_id": scan_id,
            **record,
            "created_at": datetime.utcnow().isoformat()
        }

        if self.is_connected and self.db is not None:
            try:
                res = self.db.analysis_history.insert_one(record_with_meta)
                self.db.analysis_history.update_one({"_id": res.inserted_id}, {"$set": {"scan_id": scan_id}})
                return scan_id
            except Exception as e:
                print(f"[Database] MongoDB insert error: {e}")

        # Local fallback save
        hist_file = self.fallback_dir / "analysis_history.json"
        history = []
        if hist_file.exists():
            try:
                with open(hist_file, "r") as f:
                    history = json.load(f)
            except Exception:
                history = []

        history.append(record_with_meta)
        with open(hist_file, "w") as f:
            json.dump(history, f, indent=2)

        return scan_id

    def get_scan_by_id(self, scan_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve an immutable snapshot by its unique scan_id."""
        if self.is_connected and self.db is not None:
            try:
                doc = self.db.analysis_history.find_one({"scan_id": scan_id})
                if doc:
                    doc["_id"] = str(doc["_id"])
                    return doc
            except Exception:
                pass

        hist_file = self.fallback_dir / "analysis_history.json"
        if hist_file.exists():
            try:
                with open(hist_file, "r") as f:
                    history = json.load(f)
                    for item in history:
                        if item.get("scan_id") == scan_id:
                            return item
            except Exception:
                pass
        return None

    def get_recent_scans(self, limit: int = 20) -> List[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.analysis_history.find().sort("created_at", -1).limit(limit)
                results = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    results.append(doc)
                return results
            except Exception:
                pass

        hist_file = self.fallback_dir / "analysis_history.json"
        if hist_file.exists():
            try:
                with open(hist_file, "r") as f:
                    history = json.load(f)
                    return list(reversed(history[-limit:]))
            except Exception:
                return []
        return []

    def get_dashboard_statistics(self) -> Dict[str, Any]:
        """Calculates dynamic real statistics across all historical scans."""
        scans = []
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.analysis_history.find()
                scans = list(cursor)
            except Exception:
                pass
        
        if not scans:
            hist_file = self.fallback_dir / "analysis_history.json"
            if hist_file.exists():
                try:
                    with open(hist_file, "r") as f:
                        scans = json.load(f)
                except Exception:
                    scans = []

        total_scans = len(scans)
        total_items_detected = 0
        fresh_count = 0
        semi_fresh_count = 0
        spoiled_count = 0
        undefined_count = 0
        health_scores = []
        food_frequency: Dict[str, int] = {}

        for s in scans:
            summary = s.get("overall_summary", {})
            total_items_detected += summary.get("total_objects_detected", 0)
            score = summary.get("overall_health_score")
            if score is not None:
                health_scores.append(score)

            basket = summary.get("smart_food_basket", {})
            if basket:
                fresh_count += basket.get("fresh_count", 0)
                semi_fresh_count += basket.get("semi_fresh_count", 0)
                spoiled_count += basket.get("spoiled_count", 0)
            else:
                # Fallback from detections
                for d in s.get("detections", []):
                    if not d.get("is_supported", False):
                        undefined_count += 1
                    else:
                        f_stat = d.get("freshness", "Fresh")
                        if f_stat == "Fresh":
                            fresh_count += 1
                        elif f_stat == "Semi-Fresh":
                            semi_fresh_count += 1
                        else:
                            spoiled_count += 1

            for d in s.get("detections", []):
                if d.get("is_supported", False):
                    food_name = d.get("food", "Unknown")
                    food_frequency[food_name] = food_frequency.get(food_name, 0) + 1
                else:
                    undefined_count += 1

        avg_score = round(sum(health_scores) / max(1, len(health_scores)), 1) if health_scores else 0.0

        # Sort commonly detected foods
        sorted_foods = sorted(
            [{"name": k, "count": v} for k, v in food_frequency.items()],
            key=lambda x: x["count"],
            reverse=True
        )

        return {
            "total_scans": total_scans,
            "total_items_detected": total_items_detected,
            "fresh_items_count": fresh_count,
            "semi_fresh_items_count": semi_fresh_count,
            "spoiled_items_count": spoiled_count,
            "undefined_objects_count": undefined_count,
            "average_quality_score": avg_score,
            "commonly_detected_foods": sorted_foods[:6],
            "recent_scans": self.get_recent_scans(limit=5)
        }

db_manager = DatabaseManager()
