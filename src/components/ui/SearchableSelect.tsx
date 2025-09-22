import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minSearchLength?: number;
  maxDisplayItems?: number;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  label,
  minSearchLength = 1,
  maxDisplayItems = 10,
  loading = false,
  className = '',
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectId = `searchable-select-${Math.random().toString(36).substr(2, 9)}`;

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.length >= minSearchLength) {
      const filtered = options
        .filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(0, maxDisplayItems);
      
      setFilteredOptions(filtered);
      setHighlightedIndex(-1);
    } else {
      setFilteredOptions([]);
    }
  }, [searchTerm, options, minSearchLength, maxDisplayItems]);

  // Get display text for selected value
  const getDisplayText = () => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      return selectedOption?.label || '';
    }
    return searchTerm;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (newValue.length >= minSearchLength) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    
    // Clear selection if search changes
    if (value && newValue !== getDisplayText()) {
      onChange('');
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm.length >= minSearchLength) {
      setIsOpen(true);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && searchTerm.length >= minSearchLength) {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        dropdownRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search term when value changes externally
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.label);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  const inputClasses = `
    w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
    transition-all duration-200 hover:bg-neutral-100/50
    ${error ? 'border-danger-400 focus:ring-danger-500/20 focus:border-danger-500' : 'hover:border-primary-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={selectId} className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
          error ? 'text-danger-600' : 'text-neutral-700'
        }`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={selectId}
          type="text"
          value={getDisplayText()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={inputClasses}
          autoComplete="off"
        />
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
        
        {/* Dropdown arrow */}
        {!loading && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              } ${error ? 'text-danger-400' : 'text-neutral-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                className={`
                  flex items-center px-4 py-3 cursor-pointer transition-colors duration-150
                  ${index === highlightedIndex ? 'bg-primary-50 text-primary-900' : 'hover:bg-neutral-50'}
                  ${index === filteredOptions.length - 1 ? '' : 'border-b border-neutral-100'}
                `}
              >
                {option.icon && (
                  <div className="mr-3 flex-shrink-0">
                    {option.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 truncate">
                    {option.label}
                  </div>
                  {option.subtitle && (
                    <div className="text-sm text-neutral-500 truncate">
                      {option.subtitle}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : searchTerm.length >= minSearchLength ? (
            <div className="px-4 py-6 text-center text-neutral-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No results found</p>
              <p className="text-xs mt-1">Try different search terms</p>
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-neutral-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2M7 4H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h2M7 4h10M17 4h2c1.1 0 2 .9 2 2v11c0 1.1.9 2 2 2h-2" />
              </svg>
              <p>Type {minSearchLength}+ characters to search</p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center">
          <svg className="h-4 w-4 text-danger-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-danger-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;