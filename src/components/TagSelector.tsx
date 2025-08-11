import React from 'react';
import CreatableSelect from 'react-select/creatable';
import type { Tag } from '../pages/types';
import type { MultiValue, ActionMeta } from 'react-select';

interface OptionType {
  value: number | string;
  label: string;
}

interface TagSelectorProps {
  selectedTagIds: number[];
  allTags: Tag[];
  onChange: (tagIds: number[]) => void;
  onAddTag: (tagName: string) => void;
  onDeleteTag: (tagId: number) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  allTags,
  onChange,
  onAddTag,
  onDeleteTag,
}) => {
  // Map tags to options
  const options: OptionType[] = allTags.map(tag => ({
    value: tag.id,
    label: tag.name,
  }));

  // Filter selected options from all options
  const selectedOptions = options.filter(option =>
    selectedTagIds.includes(option.value as number)
  );

  // Handle select change (multi-select + creatable)
  const handleChange = (
    newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    if (!newValue || newValue.length === 0) {
      onChange([]);
      return;
    }

    // Detect newly created tags (value is string)
    newValue.forEach(option => {
      if (typeof option.value === 'string') {
        onAddTag(option.value);
      }
    });

    // Keep only existing tag ids (numbers)
    const existingTagIds = newValue
      .filter(option => typeof option.value === 'number')
      .map(option => option.value as number);

    onChange(existingTagIds);
  };

  // Custom label to add "×" delete button inside selected tag bubbles
  const MultiValueLabel = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="flex items-center">
        <span>{data.label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const confirmDelete = window.confirm(
              `Are you sure you want to permanently delete the tag "${data.label}"?`
            );
            if (confirmDelete) {
              onDeleteTag(data.value as number);
            }
          }}
          className="ml-2 text-red-600 hover:text-red-800 font-bold"
          type="button"
          aria-label={`Delete tag ${data.label}`}
        >
          ×
        </button>
      </div>
    );
  };

  const MultiValueRemove = () => null;

  return (
    <div className="tags-container">
      <label htmlFor='tag-selector'>Tags</label>
      <CreatableSelect
        id='tag-selector'
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        components={{ MultiValueLabel, MultiValueRemove }}
        placeholder="Type to add or select tags..."
        noOptionsMessage={() => 'Type to add new tag'}
      />
    </div>
  );
};

export default TagSelector;
