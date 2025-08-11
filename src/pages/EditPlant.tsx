import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import TagSelector from '../components/TagSelector';
import { Tag } from '../pages/types';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import '../styles/EditPlant.css';
import FooterBanner from '../components/FooterBanner';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants/api';

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

export default function EditPlant() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const scientificInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [plantData, setPlantData] = useState<Plant | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  const [searchScientific, setSearchScientific] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  useEffect(() => {
    async function fetchPlant() {
      try {
        const res = await axios.get(`${API_BASE_URL}/user_plants/${id}`);
        const plant = {
          ...res.data.user_plant,
          ...res.data.user_plant.plant,
          tag_ids: res.data.user_plant.tag_ids || []
        };
        setPlantData(plant);
        setDraftImageUrl(plant.image_url || '');
        setOriginalImageUrl(plant.image_url || '');
        setSearchScientific(plant.scientific_name || '');
      } catch (err) {
        console.error(err);
        setError('Failed to load plant data.');
      }
    }
    if (id) fetchPlant();
  }, [id]);

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

  useEffect(() => {
    if (!searchScientific) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        setIsSuggestionsLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/plants/suggest?partial_name=${encodeURIComponent(searchScientific)}`
        );
        setSuggestions(res.data.suggestions || []);
        setIsSuggestionsLoading(false);
      } catch (err) {
        setIsSuggestionsLoading(false);
        console.error('Error fetching suggestions', err);
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchScientific]);

  const handleBlurOrFocusOther = (e: React.FocusEvent<HTMLInputElement>) => {
    const related = e.relatedTarget as Node | null;
    if (related && suggestionsRef.current && suggestionsRef.current.contains(related)) {
      return;
    }
    setSuggestions([]);
    setIsSuggestionsLoading(false);
  };

  if (!plantData) {
    return <p>Loading plant data...</p>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setPlantData((prev: Plant | null) =>
      prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null
    );
    if (name !== 'scientific_name') setSuggestions([]);
  };

  const handleScientificNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlantData((prev) => (prev ? { ...prev, scientific_name: value } : prev));
    setSearchScientific(value);
  };

  const handleSelectSuggestion = (scientificName: string) => {
    setSearchScientific(scientificName);
    setSuggestions([]);
    setPlantData((prev) => (prev ? { ...prev, scientific_name: scientificName } : prev));
  };

  const handleTagChange = (selectedTagIds: number[]) => {
    if (plantData) {
      setPlantData({ ...plantData, tag_ids: selectedTagIds });
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

      if (plantData) {
        setPlantData({
          ...plantData,
          tag_ids: plantData.tag_ids.filter((id: number) => id !== tagId),
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
      if (plantData) {
        setPlantData({
          ...plantData,
          tag_ids: [...plantData.tag_ids, newTag.id],
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
    if (plantData) setPlantData({ ...plantData, image_url: url });
  };

  const handleDraftImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setDraftImageUrl(result);
      if (plantData) setPlantData({ ...plantData, image_url: result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImageEdit = () => {
    setIsEditingImage(false);
  };

  const handleCancelImageEdit = () => {
    setDraftImageUrl(originalImageUrl);
    if (plantData) setPlantData({ ...plantData, image_url: originalImageUrl });
    setIsEditingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!plantData) return;

    try {
      await axios.put(`${API_BASE_URL}/user_plants/${id}`, plantData);
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

  return (
    <div className="EditPlant page">
      <Header />

      <main>
        <HeadingWithSvg text="Edit Your Plant" />

        <form onSubmit={handleSubmit}>
          <div className="EditPlant image-scientific-container">
            <div className="EditPlant plant-image-circle" title="Plant Image">
              <img
                src={plantData.image_url || DEFAULT_PLANT_IMAGE}
                alt="Plant"
                className="EditPlant plant-image"
              />
            </div>

            <div className="EditPlant scientific-name-input-wrapper">
              <label htmlFor="scientific_name">
                Scientific Name{' '}
                <span style={{ color: 'red', fontWeight: 'normal' }}>*Required</span>
              </label>
              <input
                id="scientific_name"
                type="text"
                name="scientific_name"
                value={searchScientific}
                onChange={handleScientificNameChange}
                autoComplete="off"
                ref={scientificInputRef}
                onBlur={handleBlurOrFocusOther}
              />

              <button
                type="button"
                className="EditPlant edit-image-button"
                onClick={() => {
                  if (!isEditingImage) {
                    setOriginalImageUrl(plantData.image_url || '');
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

          <div className="suggestions" ref={suggestionsRef}>
            {isSuggestionsLoading && (
              <span className="suggestions-info">Loading suggestions...</span>
            )}
            {suggestions.length > 0 && !isSuggestionsLoading && (
              <>
                <span className="suggestions-info">Suggestions:</span>
                <ul>
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button type="button" onMouseDown={() => handleSelectSuggestion(s)}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <label htmlFor="common_name">Common Name</label>
          <input
            id="common_name"
            type="text"
            name="common_name"
            value={plantData.common_name || ''}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <label htmlFor="species">Species</label>
          <input
            id="species"
            type="text"
            name="species"
            value={plantData.species || ''}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <label htmlFor="preferred_soil_conditions">Preferred Soil Conditions</label>
          <input
            id="preferred_soil_conditions"
            type="text"
            name="preferred_soil_conditions"
            value={plantData.preferred_soil_conditions || ''}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <label htmlFor="propagation_methods">Propagation Methods</label>
          <input
            id="propagation_methods"
            type="text"
            name="propagation_methods"
            value={plantData.propagation_methods || ''}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <label htmlFor="edible_parts">Edible Parts</label>
          <input
            id="edible_parts"
            type="text"
            name="edible_parts"
            value={plantData.edible_parts || ''}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <label htmlFor="planted_date">Planted Date</label>
          <input
            id="planted_date"
            type="date"
            name="planted_date"
            value={plantData.planted_date || ''}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <label htmlFor="is_outdoor">Outdoor?</label>
          <input
            id="is_outdoor"
            name="is_outdoor"
            type="checkbox"
            checked={plantData.is_outdoor || false}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <label htmlFor="is_pet_safe">Pet safe?</label>
          <input
            id="is_pet_safe"
            name="is_pet_safe"
            type="checkbox"
            checked={plantData.is_pet_safe || false}
            onChange={handleChange}
            onFocus={() => setSuggestions([])}
          />

          <TagSelector
            selectedTagIds={plantData.tag_ids || []}
            allTags={tags}
            onChange={handleTagChange}
            onDeleteTag={handleDeleteTag}
            onAddTag={handleAddTag}
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

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>

        <p>Remember to review your changes carefully before saving.</p>
      </main>

      <FooterBanner />
    </div>
  );
}
