import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Spinner from './Spinner';

const Table = ({
  columns,
  data,
  rowKey = 'id',
  pagination = true,
  pageSize = 10,
  onRowClick,
  isLoading = false,
  emptyMessage = 'ไม่มีข้อมูล',
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) return <Spinner message="กำลังโหลด..." />;

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted">
        <Inbox size={32} className="mb-3 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const rows = pagination ? data.slice(start, start + pageSize) : data;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-elevated/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, idx) => (
              <tr
                key={row[rowKey] ?? idx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${
                  onRowClick ? 'hover:bg-elevated/60 cursor-pointer' : 'hover:bg-elevated/30'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={`${row[rowKey]}-${col.key}`}
                    className="px-5 py-3.5 text-sm text-ink-dim whitespace-nowrap"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-elevated/30">
          <span className="text-xs text-muted">
            หน้า {currentPage} จาก {totalPages} · {data.length} รายการ
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-md text-ink-dim hover:bg-overlay disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-md text-ink-dim hover:bg-overlay disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
