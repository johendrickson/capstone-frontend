import { API_BASE_URL } from "../constants/api";

export async function getWeather(zip: string) {
  const res = await fetch(`${API_BASE_URL}/weather?zip=${zip}`);

  if (!res.ok) {
    const text = await res.text();
    console.error("Error response from weather API:", text);
    throw new Error(`Weather fetch failed: HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Non-JSON response from weather API:", text);
    throw new Error("Invalid JSON response from weather API");
  }

  return res.json();
}
