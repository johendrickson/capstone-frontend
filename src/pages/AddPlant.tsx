import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import TagSelector from '../components/TagSelector';
import { Tag } from '../pages/types';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import '../styles/AddPlant.css';
import FooterBanner from '../components/FooterBanner';
import { fetchPlantInfo, fetchScientificNameSuggestions } from '../api/gemini';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/api';

interface AddPlantFormData {
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

export default function AddPlant() {
  const navigate = useNavigate();
  const scientificInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [plants, setPlants] = useState<any[]>([]);

  const [formData, setFormData] = useState<AddPlantFormData>({
    user_id: 0,
    planted_date: '',
    scientific_name: '',
    common_name: '',
    species: '',
    preferred_soil_conditions: '',
    propagation_methods: '',
    edible_parts: '',
    is_pet_safe: false,
    image_url: '',
    is_outdoor: false,
    tag_ids: [],
  });

  const [tags, setTags] = useState<Tag[]>([]);

  const [draftImageUrl, setDraftImageUrl] = useState(formData.image_url || '');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [searchScientific, setSearchScientific] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [hasSuggestionBeenSelected, setHasSuggestionBeenSelected] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [isAutofillLoading, setIsAutofillLoading] = useState(false);

  async function fetchPlants() {
    try {
      const res = await axios.get(`${API_BASE_URL}/plants`);
      setPlants(res.data.plants);
    } catch (err) {
      console.error(err);
      setError('Failed to load plants.');
    }
  }

  useEffect(() => {
    fetchPlants();
  }, []);

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
        const res = await fetchScientificNameSuggestions(searchScientific);
        setSuggestions(res);
      } catch (err) {
        console.error('Error fetching suggestions', err);
        setSuggestions([]);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchScientific]);

  useEffect(() => {
    const { scientific_name } = formData;

    if (!scientific_name) {
      setSuggestions([]);
      return;
    }

    const matchedPlant = plants.find(
      (p) => p.scientific_name.toLowerCase() === scientific_name.toLowerCase()
    );

    if (matchedPlant) {
      setFormData((prev) => ({
        ...prev,
        ...matchedPlant,
      }));

      setIsAutofillLoading(false);
    } else {
      fetchGeminiData(scientific_name)
        .then(() => {})
        .catch((err) => {
          console.error(err);
          setSuggestionsError(err.message);
        });
    }
  }, [formData.scientific_name]);

  useEffect(() => {
    setDraftImageUrl(formData.image_url || '');
  }, [formData.image_url]);

  useEffect(() => {
    async function loadUserId() {
      try {
        const userId = localStorage.getItem('plantpal_user_id');
        if (userId === null) throw new Error('null user ID');
        const userIdInt = parseInt(userId);
        setFormData((prev) => ({ ...prev, user_id: userIdInt }));
      } catch (err) {
        console.error(err);
        setError('Failed to load user ID.');
      }
    }
    loadUserId();
  }, []);

  const handleSelectSuggestion = async (scientificName: string) => {
    setIsAutofillLoading(true);
    setHasSuggestionBeenSelected(true);
    setSearchScientific(scientificName);
    setSuggestions([]);

    const found = plants.find((p) => p.scientific_name === scientificName);

    if (found) {
      setFormData((prev) => ({
        ...prev,
        ...found,
      }));

      setDraftImageUrl(found.image_url || '');
    } else {
      try {
        const aiData = await fetchPlantInfo(scientificName);

        setFormData((prev) => ({
          ...prev,
          scientific_name: scientificName,
          common_name: aiData.common_name || '',
          species: aiData.species || '',
          preferred_soil_conditions: aiData.preferred_soil_conditions || '',
          propagation_methods: aiData.propagation_methods || '',
          edible_parts: aiData.edible_parts || '',
          is_pet_safe: aiData.is_pet_safe || false,
          image_url: aiData.image_url ? aiData.image_url : prev.image_url,
        }));

        setIsAutofillLoading(false);

        if (aiData.image_url) setDraftImageUrl(aiData.image_url);
      } catch (err) {
        console.error('Error fetching AI data:', err);
        setFormData((prev) => ({ ...prev, scientific_name: scientificName }));
        setIsAutofillLoading(false);
      }
    }
  };

  const handleAddTag = async (tagName: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/tags`, { name: tagName });
      const newTag: Tag = res.data.tag;
      setTags((prev) => [...prev, newTag]);
      setFormData((prev) => ({
        ...prev,
        tag_ids: [...prev.tag_ids, newTag.id],
      }));
    } catch (err) {
      console.error('Failed to add new tag', err);
      alert('Failed to add tag. Please try again.');
    }
  };


  const handleDraftImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setDraftImageUrl(url);
    setFormData({ ...formData, image_url: url });
  };

  const handleTagChange = (selectedTagIds: number[]) => {
    setFormData((prev) => ({ ...prev, tag_ids: selectedTagIds }));
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

      setFormData((prev) => ({
        ...prev,
        tag_ids: prev.tag_ids.filter((id) => id !== tagId),
      }));
    } catch (err) {
      console.error('Failed to delete tag', err);
      alert('Failed to delete tag. Please try again.');
    }
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
    try {
      await axios.post(`${API_BASE_URL}/user_plants`, formData);
      alert('Plant added successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.details || 'Failed to add plant.');
    }
  };

  const fetchGeminiData = async (scientific_name: string) => {
    const data = await fetchPlantInfo(scientific_name);

    setFormData((prev) => ({
      ...prev,
      common_name: data.common_name || "",
      species: data.species || "",
      preferred_soil_conditions: data.preferred_soil_conditions || "",
      propagation_methods: data.propagation_methods || "",
      edible_parts: data.edible_parts || "",
      is_pet_safe: data.is_pet_safe ?? false,
      image_url: data.image_url ? data.image_url : prev.image_url,
    }));
  };


  return (
    <div className="AddPlant page">
      <Header />

      <main>
        <HeadingWithSvg text="Add a New Plant" />

        <form onSubmit={handleSubmit}>
          <div className="AddPlant image-scientific-container">
            <div className={`image-edit ${isEditingImage ? '' : 'editing'}`}>
              <div className='generic-and-button'>
                <div className="AddPlant plant-image-circle" title="Plant Image">
                  <img
                    src={formData.image_url || DEFAULT_PLANT_IMAGE}
                    alt="Plant"
                    className="AddPlant plant-image"
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
              <div className="AddPlant image-edit-controls">
                <label htmlFor="image_url_input">Enter Image URL</label>
                <input
                  id="image_url_input"
                  type="url"
                  value={draftImageUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    image_url: e.target.value,
                  })}
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

          <div className="AddPlant scientific-name-input-wrapper">
            <label htmlFor="scientific_name">
              Scientific Name
            </label>
            <div>
              <input
                id="scientific_name"
                type="text"
                name="scientific_name"
                value={searchScientific}
                onChange={(e) => {
                  setHasSuggestionBeenSelected(false);
                  setSearchScientific(e.target.value);
                }}
                autoComplete="off"
                ref={scientificInputRef}
                // onBlur={handleBlurOrFocusOther}
              />
              <small style={{ color: 'red', fontWeight: 'normal' }}>*Required</small>
            </div>
          </div>

          {
            !hasSuggestionBeenSelected && (
              <div className='suggestions-wrapper'>
                <div></div>
                <div className="suggestions" ref={suggestionsRef}>
                  {isSuggestionsLoading && (
                    <span className="suggestions-info">Loading suggestions...</span>
                  )}
                  {suggestionsError && (
                    <p className='error-msg'>
                      {suggestionsError}
                    </p>
                  )}
                  {suggestions.length > 0 && !isSuggestionsLoading && (
                    <>
                      <span className="suggestions-info">Suggestions:</span>
                      <ul>
                        {suggestions.map((s) => (
                          <li key={s}>
                            <button type="button" onClick={() => handleSelectSuggestion(s)}>
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )
          }

          {
            isAutofillLoading && (
              <p className='autofill-loading'>
                A.I. is autofilling data to start you off...!
              </p>
            )
          }

          <label htmlFor="common_name">Common Name</label>
          <input
            id="common_name"
            type="text"
            name="common_name"
            value={formData.common_name}
            onChange={(e) => setFormData({
              ...formData,
              common_name: e.target.value,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <label htmlFor="species">Species</label>
          <input
            id="species"
            type="text"
            name="species"
            value={formData.species}
            onChange={(e) => setFormData({
              ...formData,
              species: e.target.value,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <label htmlFor="preferred_soil_conditions">Preferred Soil Conditions</label>
          <input
            id="preferred_soil_conditions"
            type="text"
            name="preferred_soil_conditions"
            value={formData.preferred_soil_conditions || ''}
            onChange={(e) => setFormData({
              ...formData,
              preferred_soil_conditions: e.target.value,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <label htmlFor="propagation_methods">Propagation Methods</label>
          <input
            id="propagation_methods"
            type="text"
            name="propagation_methods"
            value={formData.propagation_methods || ''}
            onChange={(e) => setFormData({
              ...formData,
              propagation_methods: e.target.value,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <label htmlFor="edible_parts">Edible Parts</label>
          <input
            id="edible_parts"
            type="text"
            name="edible_parts"
            value={formData.edible_parts || ''}
            onChange={(e) => setFormData({
              ...formData,
              edible_parts: e.target.value,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <label htmlFor="planted_date">Planted Date</label>
          <input
            id="planted_date"
            type="date"
            name="planted_date"
            value={formData.planted_date || ''}
            onChange={(e) => setFormData({
              ...formData,
              planted_date: e.target.value,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <label htmlFor="is_outdoor">Outdoor?</label>
          <input
            id="is_outdoor"
            name="is_outdoor"
            type="checkbox"
            checked={formData.is_outdoor}
            onChange={(e) => setFormData({
              ...formData,
              is_outdoor: e.target.checked,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <label htmlFor="is_pet_safe">Pet safe?</label>
          <input
            id="is_pet_safe"
            name="is_pet_safe"
            type="checkbox"
            checked={formData.is_pet_safe}
            onChange={(e) => setFormData({
              ...formData,
              is_pet_safe: e.target.checked,
            })}
            onFocus={() => setSuggestions([])}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <TagSelector
            selectedTagIds={formData.tag_ids}
            allTags={tags}
            onChange={handleTagChange}
            onDeleteTag={handleDeleteTag}
            onAddTag={handleAddTag}
            disabled={!hasSuggestionBeenSelected || isAutofillLoading}
          />

          <div className="bottom-buttons">
            <button type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit">Add Plant</button>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <p className='ai-info'>
            Plant Pal uses AI to make adding plants faster, but we recommend checking the generated info for accuracy.
          </p>

        </form>
      </main>

      <FooterBanner />
    </div>
  );
}
