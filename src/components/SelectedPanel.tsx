import React from 'react';
import type { ArtData } from '../types/ArtTypes';

interface Props {
  selectedRows: ArtData[];
}

const SelectedPanel: React.FC<Props> = ({ selectedRows }) => {
  return (
    <div className="p-4 mt-4 border border-blue-200 rounded">
      <h3>Selected Rows ({selectedRows.length})</h3>
      <ul>
        {selectedRows.map((row) => (
          <li key={row.id}>
            {row.title} - {row.place_of_origin}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectedPanel;
