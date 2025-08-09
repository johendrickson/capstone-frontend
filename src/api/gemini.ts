import { API_BASE_URL } from "../constants/api";


export async function fetchPlantInfo(scientificName: string) {
  const response = await fetch(`${API_BASE_URL}/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scientific_name: scientificName }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch plant info');
  }

  const data = await response.json();
  return data;
}

export async function fetchScientificNameSuggestions(partialName: string) {
  const response = await fetch(`${API_BASE_URL}/gemini/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partial_name: partialName }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch suggestions');
  }

  const suggestions = await response.json();
  return suggestions;
}

// Add this to make this file a module for isolatedModules TS setting
export {};
