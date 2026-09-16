import io
from PIL import Image


def test_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_food_analysis_endpoint(client):
    # Create a small dummy image in memory
    img = Image.new("RGB", (300, 300), color="green")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    files = {"file": ("test_plate.jpg", img_byte_arr, "image/jpeg")}
    response = client.post("/api/v1/food/analyze", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "detections" in data
    assert "total_calories" in data
    assert len(data["detections"]) > 0
    assert "freshness_status" in data["detections"][0]


def test_scan_history_and_recommendations(client):
    # Test GET /scans
    res_scans = client.get("/api/v1/food/scans")
    assert res_scans.status_code == 200
    assert isinstance(res_scans.json(), list)

    # Test POST /recommendations
    rec_payload = {
        "detected_items": ["avocado", "toast", "egg"],
        "freshness_statuses": ["fresh", "fresh", "fresh"]
    }
    res_rec = client.post("/api/v1/food/recommendations", json=rec_payload)
    assert res_rec.status_code == 200
    rec_data = res_rec.json()
    assert "recipe_suggestions" in rec_data
    assert len(rec_data["recipe_suggestions"]) > 0
