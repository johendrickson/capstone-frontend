import axios from "axios";
import type { Tag } from "../pages/types";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export const getAllTags = async (): Promise<Tag[]> => {
  const res = await axios.get(`${API_BASE_URL}/tags`);
  return res.data.tags;
};

export const createTag = async (name: string): Promise<Tag> => {
  const res = await axios.post(`${API_BASE_URL}/tags`, { name });
  return res.data.tag;
};

export const deleteTag = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/tags/${id}`);
};
