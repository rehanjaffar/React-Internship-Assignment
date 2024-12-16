/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';

interface Artwork {
  id: number;
  title: string;
  artist_title: string;
  place_of_origin: string;
  date_start: number;
  date_end: number;
}

const DataTableWithServerPagination: React.FC = () => {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedRowMap, setSelectedRowMap] = useState<Record<number, boolean>>({}); 

  // Fetch data for the current page
  const fetchData = async (currentPage: number) => {
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`);
      const fetchedData = response.data.data;
      const paginationInfo = response.data.pagination;

      // Map API response to Artwork structure
      setData(
        fetchedData.map((item: any) => ({
          id: item.id,
          title: item.title,
          artist_title: item.artist_title || 'Unknown Artist',
          place_of_origin: item.place_of_origin || 'Unknown Place',
          date_start: item.date_start || 'Secret',
          date_end: item.date_end || 'Secret',
        }))
      );
      setTotalRecords(paginationInfo.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Handle page change
  const handlePageChange = (event: { first: number; rows: number }) => {
    const newPage = event.first / event.rows + 1;
    setPage(newPage);
  };

  // Handle row selection toggle
  const handleRowToggle = (rowId: number, isSelected: boolean) => {
    setSelectedRowMap((prev) => ({
      ...prev,
      [rowId]: isSelected,
    }));
  };

  // Check if a row is selected
  const isRowSelected = (rowId: number): boolean => {
    return selectedRowMap[rowId] === true;
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const rowSelectionTemplate = (rowData: Artwork) => {
    const isSelected = isRowSelected(rowData.id);

    return (
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => handleRowToggle(rowData.id, e.target.checked)}
      />
    );
  };

  return (
    <div>
      <DataTable
        value={data}
        paginator
        rows={10}
        totalRecords={totalRecords}
        lazy
        onPage={handlePageChange}
        dataKey="id"
      >
        <Column body={rowSelectionTemplate} header="Select" style={{ width: '3em', textAlign: 'center' }}></Column>
        <Column field="id" filterField="representative" header="ID"></Column>
        <Column field="title" header="Title"></Column>
        <Column field="artist_title" header="Artist"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>
      </DataTable>

      <div className="custom-panel">
        <h3>Selected Rows</h3>
        <ul>
          {Object.entries(selectedRowMap)
            .filter(([_, isSelected]) => isSelected)
            .map(([rowId]) => {
              const row = data.find((item) => item.id === Number(rowId));
              return row ? (
                <li key={row.id}>
                  {row.title} by {row.artist_title} from {row.place_of_origin} ( {row.date_start}-{row.date_end} )
                </li>
              ) : null;
            })}
        </ul>
      </div>
    </div>
  );
};

export default DataTableWithServerPagination;
