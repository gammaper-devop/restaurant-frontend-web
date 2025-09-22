import React from 'react';

export interface StatusFilterValue {
  value: 'all' | 'active' | 'inactive';
  label: string;
  count?: number;
}

interface StatusFilterProps {
  value: 'all' | 'active' | 'inactive';
  onChange: (value: 'all' | 'active' | 'inactive') => void;
  options?: StatusFilterValue[];
  className?: string;
}

const defaultOptions: StatusFilterValue[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  options = defaultOptions,
  className = ''
}) => {
  return (
    <div className={`inline-flex items-center space-x-1 bg-neutral-100 rounded-xl p-1 ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
              ${isSelected
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }
            `}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`
                ml-1 px-2 py-0.5 text-xs rounded-full
                ${isSelected
                  ? 'bg-neutral-100 text-neutral-600'
                  : 'bg-neutral-200 text-neutral-500'
                }
              `}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// Hook personalizado para usar el filtro de estado
export const useStatusFilter = <T extends { active: boolean }>(
  data: T[]
): {
  filteredData: T[];
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (value: 'all' | 'active' | 'inactive') => void;
  filterOptions: StatusFilterValue[];
} => {
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const filteredData = React.useMemo(() => {
    switch (statusFilter) {
      case 'active':
        return data.filter(item => item.active);
      case 'inactive':
        return data.filter(item => !item.active);
      default:
        return data;
    }
  }, [data, statusFilter]);

  const filterOptions: StatusFilterValue[] = React.useMemo(() => [
    { value: 'all', label: 'Todos', count: data.length },
    { value: 'active', label: 'Activos', count: data.filter(item => item.active).length },
    { value: 'inactive', label: 'Inactivos', count: data.filter(item => !item.active).length },
  ], [data]);

  return {
    filteredData,
    statusFilter,
    setStatusFilter,
    filterOptions,
  };
};

export default StatusFilter;