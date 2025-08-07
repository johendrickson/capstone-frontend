import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  zip_code?: string;
  garden_name?: string;
}

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return res.data.user;
};

export const updateUser = async (
  userId: number,
  formData: Record<string, string>,
  savedZip: string
): Promise<UserProfile> => {
  let payload: Record<string, string> = {};
  if (formData.name) payload.name = formData.name;
  if (formData.email) payload.email = formData.email;
  if (formData.garden_name) payload.garden_name = formData.garden_name;

  if (formData.zip_code && formData.zip_code !== savedZip) {
    const geoRes = await axios.get(`${API_BASE_URL}/geocode`, {
      params: { zip_code: formData.zip_code },
    });
    const { lat, lon } = geoRes.data;
    payload.zip_code = formData.zip_code;
  }

  const res = await axios.patch(`${API_BASE_URL}/users/${userId}`, payload);
  return res.data.user;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/users/${userId}`);
};
