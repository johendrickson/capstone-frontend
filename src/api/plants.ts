import axios from "axios";
import type { UserPlant, UserPlantInput } from "../pages/types";
import { API_BASE_URL } from "../constants/api";


export const getUserPlants = async (userId: number): Promise<UserPlant[]> => {
  const res = await axios.get(`${API_BASE_URL}/user_plants/all/${userId}`);
  return res.data.user_plants;
};

export const getUserPlantById = async (id: number): Promise<UserPlant> => {
  const res = await axios.get(`${API_BASE_URL}/user_plants/${id}`);
  return res.data.user_plant;
};

export const createUserPlant = async (data: UserPlantInput): Promise<UserPlant> => {
  const res = await axios.post(`${API_BASE_URL}/user_plants`, data);
  return res.data.user_plant;
};

export const updateUserPlant = async (id: number, data: UserPlantInput): Promise<void> => {
  await axios.put(`${API_BASE_URL}/user_plants/${id}`, data);
};

export const deleteUserPlant = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/user_plants/${id}`);
};

