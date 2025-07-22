import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import type { ArtData } from '../types/ArtTypes';
import SelectedPanel from './SelectedPanel';
import type { DataTableStateEvent } from 'primereact/datatable';

const ArtTable: React.FC = () => {
  const [data, setData] = useState<ArtData[]>([]);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: ArtData }>({});
  const [inputValue, setInputValue] = useState('');

  const op = useRef<OverlayPanel>(null);
  const pageSize = 12;

  const fetchData = async (pageNum: number): Promise<ArtData[]> => {
    const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNum + 1}&limit=${pageSize}`);
    const result = await response.json();
    if (pageNum === page) {
      setData(result.data);
      setTotalRecords(result.pagination.total);
    }
    return result.data;
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

 const onPageChange = (e: DataTableStateEvent) => {
  setPage(e.page ?? 0); 
};

  const onSelectionChange = (e: { value: ArtData[] }) => {
    const updatedMap: { [key: number]: ArtData } = { ...selectedRows };
    const selected = e.value;

    const currentPageIds = data.map((d) => d.id);
    currentPageIds.forEach((id) => {
      delete updatedMap[id]; 
    });

    selected.forEach((item) => {
      updatedMap[item.id] = item; 
    });

    setSelectedRows(updatedMap);
  };

  const handleSubmit = async () => {
    const count = parseInt(inputValue);
    if (isNaN(count) || count <= 0) return;

    let updatedMap: { [key: number]: ArtData } = {};
    let selectedCount = 0;
    let currentPage = 0;
    let stop = false;

    while (!stop) {
      const pageData = await fetchData(currentPage);

      for (const item of pageData) {
        if (!updatedMap[item.id]) {
          updatedMap[item.id] = item;
          selectedCount++;
          if (selectedCount === count) {
            stop = true;
            break;
          }
        }
      }

      currentPage++;
      if (selectedCount >= count) break;
    }

    setSelectedRows(updatedMap);
    setPage(0); 
    op.current?.hide();
  };

  return (
    <>
      <div className="p-2">
        <Button
          type="button"
          label="Select Rows"
          icon="pi pi-sliders-h"
          onClick={(e) => op.current?.toggle(e)}
          className="mb-2"
        />

        <OverlayPanel ref={op}>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Select rows..."
              className="border rounded px-2 py-1"
            />
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>
        </OverlayPanel>
      </div>

      <DataTable
        value={data}
        paginator
        rows={pageSize}
        totalRecords={totalRecords}
        lazy
        first={page * pageSize}
        onPage={onPageChange}
        selection={Object.values(selectedRows)}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <SelectedPanel selectedRows={Object.values(selectedRows)} />
    </>
  );
};

export default ArtTable;
