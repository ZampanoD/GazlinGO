// A search bar component for filtering minerals by name.
// Represents a simple text field with automatic passing of the entered value to the parent component via a callback function.
// Uses Tailwind CSS for visual styling and interactive states.

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const { t } = useLanguage();

    return (
        <div className="p-4 border-b border-slate-200">
            <input
                type="text"
                placeholder={t('search')}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};