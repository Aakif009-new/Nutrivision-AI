def test_pdf_report_generation(client):
    response = client.get("/api/v1/reports/pdf/test-scan-123")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 100
    # PDF magic bytes check (%PDF-)
    assert response.content.startswith(b"%PDF-")
