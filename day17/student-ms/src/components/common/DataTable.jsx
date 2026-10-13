import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
  sortable = true,
  pagination = true,
  pageSize = 10,
  emptyMessage = "No data available",
  loading = false,
  loadingMessage = "Loading...",
  rowKey = "id",
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    if (sortConfig.key && sortable) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, sortConfig, columns, sortable]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pagination, pageSize, currentPage]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#eadfd8] bg-[#fffaf7]">
        <div className="text-center">
          <div className="w-9 h-9 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-[#8b7774]">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-[#eadfd8] bg-[#fffaf7] shadow-[0_8px_30px_rgba(72,37,42,0.04)] overflow-hidden ${className}`}>
      {searchable && (
        <div className="p-4 border-b border-[#eadfd8] bg-[#f8f2ee]">
          <div className="relative max-w-md">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#eadfd8] bg-white pl-11 pr-4 py-2.5 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="border-b border-[#eadfd8] bg-[#f8f2ee]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wide text-[#8b7774] ${column.className || ""}`}
                  style={{ width: column.width, textAlign: column.align }}
                  onClick={() => handleSort(column.key)}
                  style={{ ...column.style, cursor: sortable && column.sortable !== false ? "pointer" : "default" }}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && sortConfig.key === column.key && (
                      sortConfig.direction === "asc" ? <ChevronUp size={12} className="text-[#e06464]" /> : <ChevronDown size={12} className="text-[#e06464]" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-[#8b7774]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row[rowKey]}
                  className="border-b border-[#eadfd8] last:border-0 hover:bg-[#f8f2ee]/60 transition"
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 ${column.className || ""}`}
                      style={{ textAlign: column.align }}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#eadfd8] flex items-center justify-between">
          <p className="text-xs text-[#8b7774]">
            Page {currentPage} of {totalPages} ({filteredData.length} total)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#eadfd8] text-[#8b7774] hover:bg-[#f8f2ee] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    currentPage === pageNum
                      ? "bg-[#e06464] text-white"
                      : "text-[#8b7774] hover:bg-[#f8f2ee]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#eadfd8] text-[#8b7774] hover:bg-[#f8f2ee] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
      />
    </div>
  );
}

export function FilterSelect({ value, onChange, options, placeholder = "Filter", className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-4 pr-10 text-sm text-[#48252a] outline-none focus:border-[#e06464] appearance-none ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}