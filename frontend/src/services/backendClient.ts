import { AnalyzeFoodResponse, FoodScan, AIRecommendationRequest, AIRecommendationResponse } from '../types';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function analyzeFoodImage(imageFile: File, token?: string): Promise<AnalyzeFoodResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_API_URL}/api/v1/food/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errorData.detail || 'Failed to analyze image');
  }

  return res.json();
}

export async function fetchScanHistory(token?: string): Promise<FoodScan[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_API_URL}/api/v1/food/scans`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error('Failed to fetch scan history');
  }

  return res.json();
}

export async function saveScanRecord(scanData: any, token?: string): Promise<FoodScan> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_API_URL}/api/v1/food/scans`, {
    method: 'POST',
    headers,
    body: JSON.stringify(scanData),
  });

  if (!res.ok) {
    throw new Error('Failed to save scan record');
  }

  return res.json();
}

export async function fetchAIRecommendations(
  req: AIRecommendationRequest,
  token?: string
): Promise<AIRecommendationResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_API_URL}/api/v1/food/recommendations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch AI recommendations');
  }

  return res.json();
}

export function getScanPDFReportUrl(scanId: string): string {
  return `${BACKEND_API_URL}/api/v1/reports/pdf/${scanId}`;
}
