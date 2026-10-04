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

    def save_analysis(self, record: Dict[str, Any]) -> str:
        timestamp_id = f"scan_{int(datetime.utcnow().timestamp())}"
        record_with_meta = {
            "scan_id": timestamp_id,
            **record,
            "created_at": datetime.utcnow().isoformat()
        }

        if self.is_connected and self.db is not None:
            try:
                res = self.db.analysis_history.insert_one(record_with_meta)
                mongo_id = str(res.inserted_id)
                self.db.analysis_history.update_one({"_id": res.inserted_id}, {"$set": {"scan_id": mongo_id}})
                return mongo_id
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

        return timestamp_id

    def get_recent_scans(self, limit: int = 10) -> List[Dict[str, Any]]:
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

db_manager = DatabaseManager()
