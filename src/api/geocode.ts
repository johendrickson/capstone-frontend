const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export async function getLatLonForZip(zip_code: string): Promise<{ lat: number; lon: number }> {
  const response = await fetch(`${API_BASE_URL}/geocode?zip_code=${zip_code}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || "Failed to get coordinates");
  }

  const data = await response.json();
  return {
    lat: data.lat,
    lon: data.lon,
  };
}

export {}