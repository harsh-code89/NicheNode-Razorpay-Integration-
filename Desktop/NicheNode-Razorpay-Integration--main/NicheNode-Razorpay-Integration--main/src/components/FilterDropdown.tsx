import React from 'react';
import { Filter } from 'lucide-react';
import { DropdownButton, DropdownOption } from './DropdownButton';

interface FilterDropdownProps {
  label: string;
  options: DropdownOption[];
  selectedId?: string;
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  selectedId,
  onSelect,
  placeholder = "All",
  className = ""
}: FilterDropdownProps) {
  return (
    <div className={className}>
      <DropdownButton
        label={label}
        options={options}
        selectedId={selectedId}
        onSelect={onSelect}
        placeholder={placeholder}
        buttonClassName="border-slate-300 hover:border-slate-400 focus:border-blue-500"
        menuClassName="border-slate-200 shadow-lg"
        position="bottom-left"
        showSelectedIcon={false}
      />
    </div>
  );
}

// Example usage component for demonstration
export function FilterDropdownExample() {
  const [priceFilter, setPriceFilter] = React.useState<string>('all');
  const [ratingFilter, setRatingFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');

  const priceOptions: DropdownOption[] = [
    { id: 'all', label: 'All Prices' },
    { id: 'under50', label: 'Under $50/hour' },
    { id: '50to100', label: '$50 - $100/hour' },
    { id: '100to200', label: '$100 - $200/hour' },
    { id: 'over200', label: 'Over $200/hour' }
  ];

  const ratingOptions: DropdownOption[] = [
    { id: 'all', label: 'All Ratings' },
    { id: '4plus', label: '4+ Stars' },
    { id: '3plus', label: '3+ Stars' },
    { id: '2plus', label: '2+ Stars' }
  ];

  const categoryOptions: DropdownOption[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'programming', label: 'Programming & Development' },
    { id: 'design', label: 'Design & Creative' },
    { id: 'business', label: 'Business & Consulting' },
    { id: 'academic', label: 'Academic & Research' },
    { id: 'technical', label: 'Technical & Engineering' },
    { id: 'arts', label: 'Arts & Culture' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Filter Consultants</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterDropdown
          label="Price Range"
          options={priceOptions}
          selectedId={priceFilter}
          onSelect={(option) => setPriceFilter(option.id)}
          placeholder="All Prices"
        />
        
        <FilterDropdown
          label="Minimum Rating"
          options={ratingOptions}
          selectedId={ratingFilter}
          onSelect={(option) => setRatingFilter(option.id)}
          placeholder="All Ratings"
        />
        
        <FilterDropdown
          label="Category"
          options={categoryOptions}
          selectedId={categoryFilter}
          onSelect={(option) => setCategoryFilter(option.id)}
          placeholder="All Categories"
        />
      </div>
      
      {/* Display selected filters */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap gap-2">
          {priceFilter !== 'all' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {priceOptions.find(opt => opt.id === priceFilter)?.label}
            </span>
          )}
          {ratingFilter !== 'all' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {ratingOptions.find(opt => opt.id === ratingFilter)?.label}
            </span>
          )}
          {categoryFilter !== 'all' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {categoryOptions.find(opt => opt.id === categoryFilter)?.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}