import React from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  className?: string;
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  className = '',
  variant = 'default',
  size = 'md',
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortBy,
  sortDirection,
}) => {
  const containerClasses = 'overflow-hidden rounded-2xl bg-white shadow-soft border border-neutral-100';
  
  const tableClasses = {
    default: 'min-w-full divide-y divide-neutral-200',
    striped: 'min-w-full divide-y divide-neutral-200',
    bordered: 'min-w-full divide-y divide-neutral-300 border border-neutral-300',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const cellPadding = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const renderLoadingRow = () => (
    <tr>
      <td colSpan={columns.length} className={`${cellPadding[size]} text-center`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-neutral-600">Loading...</span>
        </div>
      </td>
    </tr>
  );

  const renderEmptyRow = () => (
    <tr>
      <td colSpan={columns.length} className={`${cellPadding[size]} text-center text-neutral-500`}>
        <div className="flex flex-col items-center space-y-2">
          <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <span>{emptyMessage}</span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="overflow-x-auto">
        <table className={`${tableClasses[variant]} ${sizeClasses[size]}`}>
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellPadding[size]} text-left font-semibold text-neutral-900 tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-neutral-100' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={variant === 'striped' ? 'bg-white divide-y divide-neutral-200' : 'bg-white divide-y divide-neutral-200'}>
            {loading ? (
              renderLoadingRow()
            ) : data.length === 0 ? (
              renderEmptyRow()
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    variant === 'striped' && rowIndex % 2 !== 0 ? 'bg-neutral-25' : ''
                  } hover:bg-neutral-50 transition-colors duration-150`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${cellPadding[size]} text-neutral-900 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
