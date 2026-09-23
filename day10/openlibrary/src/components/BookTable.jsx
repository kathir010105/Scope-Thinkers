import { useState } from "react";
import { AgGridReact } from "ag-grid-react";

import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

function BookTable({ data }) {
  const darkTheme = themeQuartz.withParams({
    backgroundColor: "#111827",
    foregroundColor: "#e5e7eb",
    headerBackgroundColor: "#1f2937",
    headerTextColor: "#f9fafb",
    borderColor: "#374151",
    rowHoverColor: "#1f2937",
    selectedRowBackgroundColor: "#1e3a5f",
    fontSize: 14,
  });
  const [rowData, setRowData] = useState(data);
  const [gridApi, setGridApi] = useState(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    year: "",
    publisher: "",
    isbn: "",
    language: "",
    editions: "",
  });

  const columnDefs = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      editable: false,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      editable: true,
    },
    {
      field: "author",
      headerName: "Author",
      flex: 1.5,
      editable: true,
    },
    {
      field: "year",
      headerName: "Year",
      width: 120,
      editable: true,
    },
    {
      field: "publisher",
      headerName: "Publisher",
      flex: 1.5,
      editable: true,
    },
    {
      field: "isbn",
      headerName: "ISBN",
      flex: 1.5,
      editable: true,
    },
    {
      field: "language",
      headerName: "Language",
      width: 120,
      editable: true,
    },
    {
      field: "editions",
      headerName: "Editions",
      width: 120,
      editable: true,
    },
  ];

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const handleResetData = () => {
    setRowData([...data]);
    setSelectedCount(0);

    if (gridApi) {
      gridApi.deselectAll();
      gridApi.setGridOption("quickFilterText", "");
    }
  };

  const handleGridReady = (params) => {
    setGridApi(params.api);
  };

  const handleSearch = (event) => {
    const value = event.target.value;

    if (gridApi) {
      gridApi.setGridOption("quickFilterText", value);
    }
  };

  const handleCellValueChanged = (params) => {
    const { data, colDef, newValue } = params;

    setRowData((currentRows) =>
      currentRows.map((row) =>
        row.id === data.id
          ? {
              ...row,
              [colDef.field]: newValue,
            }
          : row,
      ),
    );
  };

  const handleSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();

    setSelectedCount(selectedRows.length);
  };

  const handleDeleteSelected = () => {
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      return;
    }

    const selectedIds = new Set(selectedRows.map((row) => row.id));

    setRowData((currentRows) =>
      currentRows.filter((row) => !selectedIds.has(row.id)),
    );

    setSelectedCount(0);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNewBook((currentBook) => ({
      ...currentBook,
      [name]: value,
    }));
  };

  const handleAddBook = (event) => {
    event.preventDefault();

    if (!newBook.title.trim() || !newBook.author.trim()) {
      alert("Title and Author are required.");
      return;
    }

    const newId =
      rowData.length > 0 ? Math.max(...rowData.map((book) => book.id)) + 1 : 1;

    const bookToAdd = {
      id: newId,
      title: newBook.title,
      author: newBook.author,
      year: newBook.year || "N/A",
      publisher: newBook.publisher || "Unknown",
      isbn: newBook.isbn || "N/A",
      language: newBook.language || "N/A",
      editions: newBook.editions || 0,
    };

    setRowData((currentRows) => [...currentRows, bookToAdd]);

    setNewBook({
      title: "",
      author: "",
      year: "",
      publisher: "",
      isbn: "",
      language: "",
      editions: "",
    });

    setShowAddForm(false);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search books..."
          onChange={handleSearch}
          className="w-full lg:w-96 px-4 py-3 rounded-lg
                     bg-gray-900 border border-gray-700
                     text-white placeholder-gray-500
                     focus:outline-none focus:border-blue-500"
        />

        <div className="flex gap-3">
          {/* Add Book */}
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-3 rounded-lg font-medium
               bg-blue-600 text-white
               hover:bg-blue-700
               transition"
          >
            + Add Book
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0}
            className="px-5 py-3 rounded-lg font-medium
               bg-red-600 text-white
               hover:bg-red-700
               disabled:bg-gray-700
               disabled:text-gray-500
               disabled:cursor-not-allowed
               transition"
          >
            Delete Selected
            {selectedCount > 0 && ` (${selectedCount})`}
          </button>

          {/* Reset */}
          <button
            onClick={handleResetData}
            className="px-5 py-3 rounded-lg font-medium
               bg-gray-700 text-white
               hover:bg-gray-600
               transition"
          >
            Reset Data
          </button>
        </div>
      </div>

      {/* Add Book Form */}
      {showAddForm && (
        <div className="mb-6 bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-white">Add New Book</h2>

            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleAddBook}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Title */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Title *
              </label>

              <input
                type="text"
                name="title"
                value={newBook.title}
                onChange={handleInputChange}
                placeholder="Book title"
                className="w-full px-4 py-2.5 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Author *
              </label>

              <input
                type="text"
                name="author"
                value={newBook.author}
                onChange={handleInputChange}
                placeholder="Author name"
                className="w-full px-4 py-2.5 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Year</label>

              <input
                type="number"
                name="year"
                value={newBook.year}
                onChange={handleInputChange}
                placeholder="2026"
                className="w-full px-4 py-2.5 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Publisher
              </label>

              <input
                type="text"
                name="publisher"
                value={newBook.publisher}
                onChange={handleInputChange}
                placeholder="Publisher"
                className="w-full px-4 py-2.5 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">ISBN</label>

              <input
                type="text"
                name="isbn"
                value={newBook.isbn}
                onChange={handleInputChange}
                placeholder="ISBN"
                className="w-full px-4 py-2.5 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Language
              </label>

              <input
                type="text"
                name="language"
                value={newBook.language}
                onChange={handleInputChange}
                placeholder="eng"
                className="w-full px-4 py-2.5 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Editions */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Editions
              </label>

              <input
                type="number"
                name="editions"
                value={newBook.editions}
                onChange={handleInputChange}
                placeholder="1"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg
                           bg-blue-600 text-white
                           hover:bg-blue-700
                           transition"
              >
                Add Book
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 rounded-lg
                           bg-gray-700 text-white
                           hover:bg-gray-600
                           transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AG Grid */}
      <div
        style={{
          width: "100%",
          height: "650px",
        }}
      >
        <AgGridReact
          theme={darkTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={handleGridReady}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
}

export default BookTable;
