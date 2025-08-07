import React from 'react';
import { Tag } from '../pages/types';  // <-- import from types.ts, not api/tags

interface TagListProps {
  tags: Tag[];
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <span
          key={tag.id}
          className="bg-green-200 text-green-900 text-sm px-2 py-1 rounded-full shadow-sm"
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
};

export default TagList;
