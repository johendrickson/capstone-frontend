import React, { useState, useEffect, ChangeEvent, useRef, useCallback } from 'react';
import axios from 'axios';
import TagSelector from '../components/TagSelector';
import { Tag } from '../pages/types';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import '../styles/EditPlant.css';
import FooterBanner from '../components/FooterBanner';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants/api';
import { fetchPlantInfo } from '../api/gemini';

interface Plant {
  id: number;
  user_id: number;
  planted_date?: string;
  scientific_name: string;
  common_name?: string;
  is_outdoor: boolean;
  species?: string;
  preferred_soil_conditions?: string;
  propagation_methods?: string;
  edible_parts?: string;
  is_pet_safe?: boolean;
  image_url?: string;
  tag_ids: number[];
}

const DEFAULT_PLANT_IMAGE = '/assets/default-plant.svg';
const PLANT_DATA_ERROR_MSG = 'Failed to load plant data.';

export default function EditPlant() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scientificInputRef = useRef<HTMLInputElement>(null);

  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);

  const [formData, setFormData] = useState<Plant | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserId() {
      try {
        const userId = localStorage.getItem('plantpal_user_id');
        if (userId === null) throw new Error('null user ID');
        const userIdInt = parseInt(userId);

        setFormData((prev) => ({
          id: formData?.id || 0,
          is_outdoor: formData?.is_outdoor || true,
          scientific_name: formData?.scientific_name || '',
          tag_ids: formData?.tag_ids || [],
          ...prev,
          user_id: userIdInt,
        }));
      } catch (err) {
        console.error(err);
        setError('Failed to load user ID.');
      }
    }
    loadUserId();
  }, []);

  const fetchPlant = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user_plants/${id}`);

      const plant = {
        ...res.data.user_plant,
        ...res.data.user_plant.plant,
        planted_date: res.data.user_plant.planted_date
          ? res.data.user_plant.planted_date.split('T')[0]
          : '',
        tag_ids: res.data.user_plant.tag_ids
          || res.data.user_plant.tags?.map((t: any) => t.id)
          || []
      };

      setFormData(plant);
      setDraftImageUrl(plant.image_url || '');
      setOriginalImageUrl(plant.image_url || '');
    } catch (err) {
      console.error(err);
      setError(PLANT_DATA_ERROR_MSG);
    } finally {
      setIsLoadingInitialData(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchPlant();
  }, [id, fetchPlant]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await axios.get(`${API_BASE_URL}/tags`);
        setTags(res.data.tags);
      } catch (err) {
        console.error(err);
        setError('Failed to load tags.');
      }
    }
    fetchTags();
  }, []);

  if (!formData) {
    return (
      <div className="EditPlant page">
        <Header />

        <main>
          <HeadingWithSvg text="Edit Your Plant" />

          <p>Loading plant data...</p>
        </main>

        <FooterBanner />
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setFormData((prev: Plant | null) =>
      prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null
    );
  };

  const handleTagChange = (selectedTagIds: number[]) => {
    if (formData) {
      setFormData({ ...formData, tag_ids: selectedTagIds });
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    const tagToDelete = tags.find((t) => t.id === tagId);
    if (!tagToDelete) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete the tag "${tagToDelete.name}"?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/tags/${tagId}`);
      setTags((prev) => prev.filter((t) => t.id !== tagId));

      if (formData) {
        setFormData({
          ...formData,
          tag_ids: formData.tag_ids.filter((id: number) => id !== tagId),
        });
      }
    } catch (err) {
      console.error('Failed to delete tag', err);
      alert('Failed to delete tag. Please try again.');
    }
  };

  const handleAddTag = async (tagName: string) => {
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/tags`, { name: tagName });
      const newTag: Tag = res.data.tag;
      setTags((prev) => [...prev, newTag]);

      if (formData) {
        setFormData({
          ...formData,
          tag_ids: [...formData.tag_ids, newTag.id],
        });
      }
    } catch (err) {
      console.error('Failed to add tag', err);
      alert('Failed to add new tag. Please try again.');
    }
  };

  const handleDraftImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setDraftImageUrl(url);
    if (formData) setFormData({ ...formData, image_url: url });
  };

  const handleDraftImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      setDraftImageUrl(result);
      if (formData) setFormData({ ...formData, image_url: result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImageEdit = () => {
    setIsEditingImage(false);
  };

  const handleCancelImageEdit = () => {
    setDraftImageUrl(originalImageUrl);
    if (formData) setFormData({ ...formData, image_url: originalImageUrl });
    setIsEditingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData) return;

    try {
      await axios.put(`${API_BASE_URL}/user_plants/${id}`, formData);
      alert('Plant updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.details || 'Failed to update plant.');
    }
  };

  const handleDeletePlant = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this plant?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/user_plants/${id}`);
      alert('Plant deleted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete plant', err);
      alert('Failed to delete plant. Please try again.');
    }
  };

  const fetchGeminiData = async (scientific_name: string) => {
    const data = await fetchPlantInfo(scientific_name);

    setFormData((prev) => ({
      tag_ids: [],
      id: data.id || 0,
      user_id: data.user_id || 0,
      scientific_name: data.scientific_name || '',
      is_outdoor: data.is_outdoor || true,
      ...prev,
      common_name: data.common_name || "",
      species: data.species || "",
      preferred_soil_conditions: data.preferred_soil_conditions || "",
      propagation_methods: data.propagation_methods || "",
      edible_parts: data.edible_parts || "",
      is_pet_safe: data.is_pet_safe ?? false,
      image_url: data.image_url || '',
    }));
  };

  return (
    <div className="EditPlant page">
      <Header />

      <main>
        <HeadingWithSvg text="Edit Your Plant" />

        <form onSubmit={handleSubmit}>
          <div className="EditPlant image-scientific-container">
            <div className={`image-edit ${isEditingImage ? '' : 'editing'}`}>
              <div className='generic-and-button'>
                <div className="EditPlant plant-image-circle" title="Plant Image">
                  <img
                    src={formData.image_url || DEFAULT_PLANT_IMAGE}
                    alt="Plant"
                    className="EditPlant plant-image"
                  />
                </div>
                <button
                  type="button"
                  className="AddPlant edit-image-button"
                  onClick={() => {
                    if (!isEditingImage) {
                      setOriginalImageUrl(formData.image_url || '');
                    }
                    setIsEditingImage(!isEditingImage);
                  }}
                >
                  {isEditingImage ? 'Close Image Editor' : 'Edit Image'}
                </button>
              </div>
            </div>

            {isEditingImage && (
              <div className="EditPlant image-edit-controls">
                <label htmlFor="image_url_input">Enter Image URL</label>
                <input
                  id="image_url_input"
                  type="url"
                  value={draftImageUrl}
                  onChange={handleDraftImageUrlChange}
                  placeholder="https://example.com/plant.jpg"
                />

                <label htmlFor="image_file_input">Or Upload an Image</label>
                <input
                  id="image_file_input"
                  type="file"
                  accept="image/*"
                  onChange={handleDraftImageFileChange}
                />

                <div className="image-edit-buttons">
                  <button type="button" onClick={handleSaveImageEdit}>
                    Save
                  </button>
                  <button type="button" onClick={handleCancelImageEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="EditPlant scientific-name-input-wrapper">
            <label htmlFor="scientific_name">
              Scientific Name{' '}
            </label>
            <div>
              <input
                id="scientific_name"
                type="text"
                name="scientific_name"
                value={formData.scientific_name}
                onChange={handleChange}
                autoComplete="off"
                ref={scientificInputRef}
              />
              <small style={{ color: 'red', fontWeight: 'normal' }}>*Required</small>
            </div>
          </div>

          <label htmlFor="common_name">Common Name</label>
          <input
            id="common_name"
            type="text"
            name="common_name"
            value={formData.common_name || ''}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <label htmlFor="species">Species</label>
          <input
            id="species"
            type="text"
            name="species"
            value={formData.species || ''}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <label htmlFor="preferred_soil_conditions">Preferred Soil Conditions</label>
          <input
            id="preferred_soil_conditions"
            type="text"
            name="preferred_soil_conditions"
            value={formData.preferred_soil_conditions || ''}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <label htmlFor="propagation_methods">Propagation Methods</label>
          <input
            id="propagation_methods"
            type="text"
            name="propagation_methods"
            value={formData.propagation_methods || ''}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <label htmlFor="edible_parts">Edible Parts</label>
          <input
            id="edible_parts"
            type="text"
            name="edible_parts"
            value={formData.edible_parts || ''}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <label htmlFor="planted_date">Planted Date</label>
          <input
            id="planted_date"
            type="date"
            name="planted_date"
            value={formData.planted_date || ''}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <label htmlFor="is_outdoor">Outdoor?</label>
          <input
            id="is_outdoor"
            name="is_outdoor"
            type="checkbox"
            checked={formData.is_outdoor || false}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <label htmlFor="is_pet_safe">Pet safe?</label>
          <input
            id="is_pet_safe"
            name="is_pet_safe"
            type="checkbox"
            checked={formData.is_pet_safe || false}
            onChange={handleChange}
            disabled={
              isLoadingInitialData
            }
          />

          <TagSelector
            selectedTagIds={formData.tag_ids || []}
            allTags={tags}
            onChange={handleTagChange}
            onDeleteTag={handleDeleteTag}
            onAddTag={handleAddTag}
            disabled={
              isLoadingInitialData
            }
          />

          <div className="bottom-buttons">
            <button type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit">Save</button>
            <button type="button" onClick={handleDeletePlant} className="delete-button">
              Delete Plant
            </button>
          </div>

          {error && (
            <p style={{ color: 'red' }}>
              {error}
              {
                error === PLANT_DATA_ERROR_MSG && (
                  <>
                    {' '}
                    <button
                      onClick={() => {
                        fetchPlant();
                      }}
                    >
                      retry
                    </button>
                  </>
                )
              }
            </p>
          )}
        </form>

        <p>Remember to review your changes carefully before saving.</p>
      </main>

      <FooterBanner />
    </div>
  );
}
