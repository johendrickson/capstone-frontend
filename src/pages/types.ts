// Tag type
export interface Tag {
  id: number;
  name: string;
}

// For plants owned by users (UserPlant) - data from backend API
export interface UserPlantInput {
  plant_id: number; // foreign key to Plant entity
  is_outdoor: boolean;
  planted_date: string;
  tag_ids: number[];
}

export interface UserPlant extends UserPlantInput {
  id: number;
  user_id: number;
  tags: Tag[];
  planted_date: string;
  plant: PlantInfo; // nested plant info from API
}

// Plant info data (scientific/common names, etc)
export interface PlantInfo {
  id: number;
  scientific_name: string;
  common_name: string;
  species: string;
  preferred_soil_conditions: string;
  propagation_methods: string;
  edible_parts: string;
  is_pet_safe: boolean;
  image_url: string;
}

// This is the shape used in AddPlant and EditPlant forms, matching backend fields
export interface PlantFormInput {
  plant_id: number;
  scientific_name: string;
  common_name: string;
  species: string;
  preferred_soil_conditions: string;
  propagation_methods: string;
  edible_parts: string;
  is_pet_safe: boolean;
  image_url: string;
  planted_date: string;
  is_outdoor: boolean;
  tag_ids: number[];
}

export interface PlantFormData {
  plant_id?: number; // optional because user might type scientific_name first
  scientific_name: string;
  common_name?: string;
  species?: string;
  preferred_soil_conditions?: string;
  propagation_methods?: string;
  edible_parts?: string;
  is_pet_safe?: boolean;
  image_url?: string;
  planted_date: string;
  is_outdoor: boolean;
  tag_ids: number[];
}